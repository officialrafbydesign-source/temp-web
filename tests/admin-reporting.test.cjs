const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { NextResponse } = require("next/server");
const root = path.resolve(__dirname, "..");
const plain = (value) => JSON.parse(JSON.stringify(value));
function load(name, mocks = {}) {
  const source = fs.readFileSync(path.join(root, name), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { URL, module, exports: module.exports, require: (id) => id in mocks ? mocks[id] : require(id), console: { ...console, error() {} } });
  return module.exports;
}
const reporting = load("lib/adminReporting.ts");
const auth = (authorized) => ({ authorizeAdminApi: async () => authorized ? { authorized: true } : { authorized: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } });

test("the new reporting period starts at UK midnight on 16 October, including the boundary", () => {
  assert.equal(reporting.includedInReports({ createdAt: "2026-10-15T22:59:59.999Z" }, "current"), false);
  assert.equal(reporting.includedInReports({ createdAt: "2026-10-15T23:00:00.000Z" }, "current"), true);
  assert.equal(reporting.includedInReports({ createdAt: "2026-10-16T00:00:00+01:00" }, "current"), true);
  assert.equal(reporting.includedInReports({ createdAt: "invalid" }, "current"), false);
});
test("all-time restores historical orders while both periods exclude flagged tests", () => {
  assert.equal(reporting.includedInReports({ createdAt: "2020-01-01" }, "all"), true);
  for (const period of ["all", "current"]) assert.equal(reporting.includedInReports({ createdAt: "2026-10-16", excludedFromReports: true }, period), false);
});
test("only the explicit all-time choice disables the date cutoff", () => {
  for (const value of [null, "", "today", "ALL", "unknown"]) assert.equal(reporting.reportingPeriod(value), "current");
  assert.equal(reporting.reportingPeriod("all"), "all");
  assert.deepEqual(plain(reporting.reportingOrderWhere("all")), { excludedFromReports: false });
});

const orders = [
  { id: "old", createdAt: "2026-10-15T22:59:59.999Z", status: "paid", amount: 99999, excludedFromReports: false },
  { id: "boundary", createdAt: reporting.REPORTING_START, status: "paid", amount: 2999, excludedFromReports: false },
  { id: "processing", createdAt: "2026-10-16", status: "processing", amount: 1234, excludedFromReports: false },
  { id: "shipped", createdAt: "2026-10-16", status: "shipped", amount: 2000, excludedFromReports: false },
  { id: "delivered", createdAt: "2026-10-16", status: "delivered", amount: 3000, excludedFromReports: false },
  { id: "test", createdAt: "2026-10-16", status: "paid", amount: 50000, excludedFromReports: true },
  { id: "pending", createdAt: "2026-10-16", status: "pending", amount: 60000, excludedFromReports: false },
  { id: "cancelled", createdAt: "2026-10-16", status: "cancelled", amount: 70000, excludedFromReports: false },
];
const logs = [
  { id: "old", createdAt: "2026-10-14", type: "download", beatId: "beat-1" },
  { id: "new", createdAt: reporting.REPORTING_START, type: "download", beatId: "beat-1" },
  { id: "play", createdAt: "2026-10-16", type: "PLAY", beatId: "beat-1" },
];
function matches(row, where = {}) {
  if ("excludedFromReports" in where && row.excludedFromReports !== where.excludedFromReports) return false;
  if (where.createdAt && Date.parse(row.createdAt) < Date.parse(where.createdAt.gte)) return false;
  if (where.status && (typeof where.status === "string" ? row.status !== where.status : !where.status.in.includes(row.status))) return false;
  if (where.type?.not && row.type.toLowerCase() === where.type.not.toLowerCase()) return false;
  if (where.type?.equals && row.type.toLowerCase() !== where.type.equals.toLowerCase()) return false;
  return true;
}
function readFixture(authorized = true) {
  const calls = [];
  const prisma = {
    order: {
      count: async ({ where }) => { calls.push(["orders", where]); return orders.filter((row) => matches(row, where)).length; },
      aggregate: async ({ where }) => { calls.push(["revenue", where]); return { _sum: { amount: orders.filter((row) => matches(row, where)).reduce((sum, row) => sum + row.amount, 0) || null } }; },
    },
    downloadLog: {
      count: async ({ where }) => logs.filter((row) => matches(row, where)).length,
      findMany: async ({ where }) => logs.filter((row) => matches(row, where)),
      groupBy: async ({ where }) => [{ beatId: "beat-1", _count: { beatId: logs.filter((row) => matches(row, where)).length } }],
    },
  };
  const mocks = { "@/lib/prisma": { prisma }, "@/lib/adminApi": auth(authorized), "@/lib/adminReporting": reporting, "@prisma/client": {} };
  return { calls, mocks, stats: load("app/api/admin/stats/route.ts", mocks), analytics: load("lib/analytics.ts", mocks) };
}
for (const period of ["current", "all"]) {
  test(`${period} stats include confirmed sales only, retain pence, and apply the same rules to Analytics`, async () => {
    const f = readFixture();
    const response = await f.stats.GET(new Request(`https://example.com/api/admin/stats?period=${period}`));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    const data = await response.json();
    assert.equal(data.totalOrders, period === "current" ? 4 : 5);
    assert.equal(data.totalRevenue, 9233 + (period === "all" ? 99999 : 0));
    assert.equal(data.pendingOrders, 1);
    assert.equal(data.cancelledOrders, 1);
    assert.equal(data.totalDownloads, period === "current" ? 1 : 2);
    assert.equal(data.totalPlays, 1);
    const analytics = await f.analytics.getAdminAnalytics(period);
    assert.equal(analytics.totalOrders, data.totalOrders);
    assert.equal(analytics.totalRevenue, data.totalRevenue);
    assert.equal(analytics.totalDownloads, data.totalDownloads);
    assert.equal(analytics.recentDownloads.length, data.totalDownloads);
    assert.equal(analytics.topBeats[0]._count.beatId, data.totalDownloads);
  });
}
test("the default stats request uses the new period", async () => {
  const f = readFixture();
  const data = await (await f.stats.GET(new Request("https://example.com/api/admin/stats"))).json();
  assert.equal(data.totalRevenue, 9233);
});
test("a catalogue with only historical/test orders has zero new sales totals", async () => {
  const historical = orders.filter((order) => ["old", "test"].includes(order.id));
  const current = historical.filter((order) => reporting.includedInReports(order, "current"));
  assert.equal(current.length, 0);
  assert.equal(current.reduce((sum, order) => sum + order.amount, 0), 0);
});
test("statistics and analytics are protected by admin authorization", async () => {
  const f = readFixture(false);
  assert.equal((await f.stats.GET(new Request("https://example.com/api/admin/stats"))).status, 401);
  const route = load("app/api/admin/analytics/route.ts", { ...f.mocks, "@/lib/analytics": f.analytics });
  assert.equal((await route.GET(new Request("https://example.com/api/admin/analytics"))).status, 401);
  assert.equal(f.calls.length, 0);
});
test("analytics API forwards the all-time selection", async () => {
  const f = readFixture();
  const route = load("app/api/admin/analytics/route.ts", { ...f.mocks, "@/lib/analytics": f.analytics });
  const data = await (await route.GET(new Request("https://example.com/api/admin/analytics?period=all"))).json();
  assert.equal(data.totalRevenue, 109232);
});

function writeFixture({ authorized = true, exists = true, failure = false } = {}) {
  const row = { id: "order-1", status: "paid", amount: 2999, downloadUrl: "private/audio.mp3", contractPdfUrl: "private/contract.pdf", excludedFromReports: false, items: [{ id: "item-1", quantity: 1, variantId: "variant-1" }] };
  const calls = [];
  const prisma = { order: { updateMany: async (args) => {
    calls.push(plain(args));
    if (failure) throw new Error("Database unavailable");
    if (!exists) return { count: 0 };
    Object.assign(row, args.data);
    return { count: 1 };
  } } };
  return { row, calls, route: load("app/api/admin/orders/[id]/reporting/route.ts", { "@/lib/prisma": { prisma }, "@/lib/adminApi": auth(authorized) }) };
}
function patch(f, body, id = "order-1") {
  return f.route.PATCH(new Request("https://example.com/api/admin/orders/order-1/reporting", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) }), { params: Promise.resolve({ id }) });
}
test("excluding and restoring an order changes only its reporting flag", async () => {
  const f = writeFixture();
  const original = plain(f.row);
  const excluded = await patch(f, { excludedFromReports: true, status: "cancelled", amount: 0, downloadUrl: null });
  assert.equal(excluded.status, 200);
  assert.deepEqual(f.calls[0], { where: { id: "order-1" }, data: { excludedFromReports: true } });
  assert.deepEqual(f.row, { ...original, excludedFromReports: true });
  assert.equal((await patch(f, { excludedFromReports: false })).status, 200);
  assert.deepEqual(f.row, original);
});
test("unauthorized exclusion cannot write an order", async () => {
  const f = writeFixture({ authorized: false });
  assert.equal((await patch(f, { excludedFromReports: true })).status, 401);
  assert.equal(f.calls.length, 0);
});
test("invalid flags, missing IDs and malformed JSON are rejected without writes", async () => {
  const f = writeFixture();
  for (const body of [{}, null, [], { excludedFromReports: "true" }, { excludedFromReports: 1 }, "{bad"]) assert.equal((await patch(f, body)).status, 400);
  assert.equal((await patch(f, { excludedFromReports: true }, " ")).status, 400);
  assert.equal(f.calls.length, 0);
});
test("missing orders and database failures do not report success", async () => {
  assert.equal((await patch(writeFixture({ exists: false }), { excludedFromReports: true })).status, 404);
  const f = writeFixture({ failure: true });
  assert.equal((await patch(f, { excludedFromReports: true })).status, 500);
  assert.equal(f.row.excludedFromReports, false);
});
