const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { NextResponse } = require("next/server");
const root = path.resolve(__dirname, "..");
function load(name, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(root, name), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: (id) => id in mocks ? mocks[id] : require(id), console: { error() {} } });
  return module.exports;
}
const helper = load("lib/beatStoreOrderSave.ts");
const ids = Array.from({ length: 143 }, (_, index) => `beat-${143 - index}`);
const request = (body) => new Request("https://example.com/api/admin/beats/order", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) });
function fixture({ authorized = true, catalogueMatches = true, error } = {}) {
  const calls = [];
  const route = load("app/api/admin/beats/order/route.ts", {
    "@/lib/beatStoreOrderSave": helper,
    "@/lib/adminApi": { authorizeAdminApi: async () => authorized ? { authorized: true } : { authorized: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } },
    "@/lib/prisma": { prisma: { $queryRaw: async (statement) => {
      calls.push(statement);
      if (error) throw error;
      const input = JSON.parse(statement.values[0]);
      return [{ catalogueMatches, items: catalogueMatches ? input.map((id, index) => ({ id, storeOrder: index + 1 })) : [] }];
    } } },
  });
  return { route, calls };
}
test("the complete 143-beat catalogue is saved with one parameterized query", async () => {
  const f = fixture(); const response = await f.route.PATCH(request({ ids }));
  assert.equal(response.status, 200); assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(f.calls.length, 1); assert.deepEqual(JSON.parse(f.calls[0].values[0]), ids);
  const result = await response.json(); assert.equal(result.success, true);
  assert.deepEqual(result.items, ids.map((id, index) => ({ id, storeOrder: index + 1 })));
});
test("JSON IDs are parameters rather than executable SQL", () => {
  const malicious = "x'); DROP TABLE public.\"Beat\";--";
  const statement = helper.beatStoreOrderStatement([malicious, "hidden beat", "日本語"]);
  assert.equal(statement.values.length, 1);
  assert.deepEqual(JSON.parse(statement.values[0]), [malicious, "hidden beat", "日本語"]);
  assert.equal(statement.text.includes(malicious), false);
});
test("authorization and input validation happen before database access", async () => {
  const denied = fixture({ authorized: false }); assert.equal((await denied.route.PATCH(request({ ids }))).status, 401); assert.equal(denied.calls.length, 0);
  for (const body of [null, {}, { ids: null }, { ids: [1] }, { ids: [""] }, { ids: ["a", "a"] }, "{"]) {
    const f = fixture(); assert.equal((await f.route.PATCH(request(body))).status, 400); assert.equal(f.calls.length, 0);
  }
});
test("a changed catalogue returns a conflict instead of claiming a partial save", async () => {
  const f = fixture({ catalogueMatches: false }); const response = await f.route.PATCH(request({ ids }));
  assert.equal(response.status, 409); assert.match((await response.json()).error, /catalogue changed/);
});
test("busy, timeout and deadlock errors retain a useful retry message without SQL details", async () => {
  for (const error of [{ code: "P2028", message: "secret connection string" }, { code: "P2024" }, { code: "P2010", meta: { code: "40P01" } }]) {
    const f = fixture({ error }); const response = await f.route.PATCH(request({ ids })); const body = await response.json();
    assert.equal(response.status, 503); assert.match(body.error, /draft is still here/); assert.doesNotMatch(JSON.stringify(body), /secret connection/);
  }
});
test("other failures report a safe error code and do not report success", async () => {
  const f = fixture({ error: { code: "P2010", message: "private SQL details" } }); const response = await f.route.PATCH(request({ ids })); const body = await response.json();
  assert.equal(response.status, 500); assert.equal(body.code, "P2010"); assert.doesNotMatch(JSON.stringify(body), /private SQL/); assert.notEqual(body.success, true);
});
