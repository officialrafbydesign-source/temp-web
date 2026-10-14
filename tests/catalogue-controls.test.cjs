const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { NextResponse, NextRequest } = require("next/server");
const root = path.resolve(__dirname, "..");

function fixture(options = {}) {
  const release = { id: "release-1", title: "Music", artist: { name: "RAF" }, songs: [], coverUrl: null };
  const flags = { isPublished: true, deletedAt: null };
  const beat = { ...flags, id: "beat-1", title: "Beat", isAvailable: true, exclusiveSoldAt: null, licenses: [{ id: "license-1", name: "Standard", price: 1000, fileUrl: "private.wav", beatId: "beat-1" }], tags: [], downloadLogs: [] };
  const clothing = { ...flags, id: "clothing-1", name: "Shirt", price: 20, salePrice: null, imageUrls: [], variants: [{ id: "variant-1", size: "M", color: "Black", stock: 4 }] };
  const music = { ...flags, id: "music-1", releaseId: release.id, release, price: 3, itemType: "DIGITAL", fileUrl: "private.zip" };
  const state = { authorized: true, updates: [], queries: [], checkoutCalls: [], orderCalls: [], rows: { beat: [beat], product: [clothing], musicProduct: [music] }, ...options };
  const matches = (row, where = {}) => Object.entries(where).every(([key, value]) => {
    if (key === "OR") return value.some((clause) => matches(row, clause));
    if (!["id", "releaseId", "deletedAt", "isPublished", "isAvailable", "exclusiveSoldAt"].includes(key)) return true;
    return row[key] === value;
  });
  const prisma = {};
  for (const kind of ["beat", "product", "musicProduct"]) {
    prisma[kind] = {
      findMany: async (args = {}) => { state.queries.push({ kind, args }); return state.rows[kind].filter((row) => matches(row, args.where)); },
      findFirst: async (args) => { state.queries.push({ kind, args }); return state.rows[kind].find((row) => matches(row, args.where)) || null; },
      findUnique: async (args) => { state.queries.push({ kind, args }); return state.rows[kind].find((row) => matches(row, args.where)) || null; },
      updateMany: async (args) => {
        if (state.dbFailure) throw new Error("Test database failure");
        state.updates.push({ kind, args });
        const rows = state.rows[kind].filter((row) => matches(row, args.where));
        rows.forEach((row) => Object.assign(row, args.data));
        return { count: rows.length };
      },
      delete: () => { throw new Error("Must not hard-delete catalogue records"); },
      deleteMany: () => { throw new Error("Must not hard-delete related records"); },
    };
  }
  prisma.license = { findUnique: async () => ({ ...beat.licenses[0], beat }) };
  prisma.song = { findUnique: async () => ({ id: "song-1", title: "Track", price: 1, sellIndividually: true, release: { ...release, product: music } }) };
  prisma.release = { findUnique: async () => ({ ...release, product: music }) };
  prisma.order = {
    create: async (args) => { state.orderCalls.push(args); return { id: "test-order" }; },
    update: async () => ({}),
  };
  const cache = new Map();
  function load(file) {
    if (!path.extname(file)) file += ".ts";
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const requireFixture = (id) => {
      if (id === "server-only") return {};
      if (id === "@/lib/prisma") return { prisma };
      if (id === "@/lib/adminApi") return { authorizeAdminApi: async () => state.authorized ? { authorized: true } : { authorized: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } };
      if (id === "@/lib/auth") return { getCurrentUser: async () => ({ id: "test-user", email: "test@example.com" }) };
      if (id === "@/lib/r2") return { getPresignedDownloadUrl: async () => "https://example.com/test-only" };
      if (id === "stripe") return class Stripe {
        checkout = { sessions: { create: async (args) => { state.checkoutCalls.push(args); return { id: "test-session", url: "https://example.com/test-only" }; } } };
      };
      if (id === "@prisma/client") return { ProductType: { beat: "beat", music: "music", clothing: "clothing", service: "service", merch: "merch", design: "design" } };
      if (id.startsWith("@/")) return load(path.join(root, id.slice(2)));
      if (id.startsWith(".")) return load(path.resolve(path.dirname(file), id));
      return require(id);
    };
    const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    vm.runInNewContext(code, {
      module, exports: module.exports, require: requireFixture, URL, Request, Response, Buffer,
      process: { env: { STRIPE_SECRET_KEY: "test-only", NEXT_PUBLIC_SITE_URL: "https://example.com" } },
      console: { error() {} },
    }, { filename: file });
    return module.exports;
  }
  return { state, load: (name) => load(path.join(root, name)) };
}
function request(method, body, url = "https://example.com/api/admin/catalogue/beats/beat-1") {
  return new NextRequest(url, { method, ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) }) });
}
const kinds = { beats: ["beat", "beat-1"], clothing: ["product", "clothing-1"], music: ["musicProduct", "music-1"] };

test("administrator authorization is required for every catalogue mutation", async () => {
  const f = fixture({ authorized: false });
  for (const kind of Object.keys(kinds)) {
    for (const method of ["PATCH", "DELETE"]) {
      const response = await f.load("lib/catalogueAdmin.ts").catalogueAdminAction(request(method, method === "PATCH" ? { isPublished: false } : undefined), kind, kinds[kind][1]);
      assert.equal(response.status, 401);
    }
  }
  assert.equal(f.state.updates.length, 0);
});

test("hide and show change visibility without changing catalogue or stock data", async () => {
  for (const [kind, [model, id]] of Object.entries(kinds)) {
    const f = fixture();
    const row = f.state.rows[model][0];
    const before = JSON.stringify(row);
    const handler = f.load("lib/catalogueAdmin.ts").catalogueAdminAction;
    assert.equal((await handler(request("PATCH", { isPublished: false }), kind, id)).status, 200);
    assert.equal(row.isPublished, false);
    assert.equal((await handler(request("PATCH", { isPublished: true }), kind, id)).status, 200);
    assert.equal(JSON.stringify(row), before);
  }
});

test("delete archives each item and preserves files, licences, tracks and variants", async () => {
  for (const [kind, [model, id]] of Object.entries(kinds)) {
    const f = fixture();
    const row = f.state.rows[model][0];
    const before = JSON.parse(JSON.stringify(row));
    const response = await f.load("lib/catalogueAdmin.ts").catalogueAdminAction(request("DELETE"), kind, id);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).deleted, true);
    assert.equal(row.isPublished, false);
    assert.ok(row.deletedAt);
    const after = JSON.parse(JSON.stringify(row));
    delete after.isPublished; delete after.deletedAt; delete before.isPublished; delete before.deletedAt;
    assert.deepEqual(after, before);
    assert.equal(f.state.orderCalls.length, 0);
  }
});

test("deleted items cannot be shown again through a stale admin action", async () => {
  const f = fixture();
  const handler = f.load("lib/catalogueAdmin.ts").catalogueAdminAction;
  await handler(request("DELETE"), "beats", "beat-1");
  const response = await handler(request("PATCH", { isPublished: true }), "beats", "beat-1");
  assert.equal(response.status, 404);
  assert.equal(f.state.rows.beat[0].isPublished, false);
});

test("exclusively sold and unavailable beats cannot be republished", async () => {
  for (const values of [{ isAvailable: false }, { exclusiveSoldAt: "test-date" }]) {
    const f = fixture();
    Object.assign(f.state.rows.beat[0], values, { isPublished: false });
    const response = await f.load("lib/catalogueAdmin.ts").catalogueAdminAction(request("PATCH", { isPublished: true }), "beats", "beat-1");
    assert.equal(response.status, 409);
    assert.equal(f.state.updates.length, 0);
  }
});

test("invalid IDs, kinds and request bodies do not change records", async () => {
  for (const [kind, id, body] of [["wrong", "beat-1", { isPublished: false }], ["beats", "", { isPublished: false }], ["beats", "beat-1", {}], ["beats", "beat-1", { isPublished: "false" }], ["beats", "beat-1", []], ["beats", "beat-1", "invalid JSON"]]) {
    const f = fixture();
    const response = await f.load("lib/catalogueAdmin.ts").catalogueAdminAction(request("PATCH", body), kind, id);
    assert.equal(response.status, 400);
    assert.equal(f.state.updates.length, 0);
  }
});

test("database failures never report a successful save", async () => {
  const f = fixture({ dbFailure: true });
  const response = await f.load("lib/catalogueAdmin.ts").catalogueAdminAction(request("DELETE"), "music", "music-1");
  assert.equal(response.status, 500);
  assert.equal((await response.json()).success, undefined);
});

test("dynamic route awaits its parameters and delegates to the protected handler", async () => {
  const f = fixture();
  const route = f.load("app/api/admin/catalogue/[kind]/[id]/route.ts");
  const response = await route.PATCH(request("PATCH", { isPublished: false }), { params: Promise.resolve({ kind: "clothing", id: "clothing-1" }) });
  assert.equal(response.status, 200);
  assert.equal(f.state.rows.product[0].isPublished, false);
});

test("existing music and clothing DELETE URLs archive rather than hard-delete", async () => {
  for (const [route, model, id] of [["app/api/admin/clothing/route.ts", "product", "clothing-1"], ["app/api/admin/music-products/route.ts", "musicProduct", "music-1"], ["app/api/clothing/route.ts", "product", "clothing-1"], ["app/api/music/route.ts", "musicProduct", "music-1"]]) {
    const f = fixture();
    const response = await f.load(route).DELETE(request("DELETE", undefined, `https://example.com/api?id=${id}`));
    assert.equal(response.status, 200);
    assert.ok(f.state.rows[model][0].deletedAt);
  }
});

test("legacy catalogue write routes reject non-admin users", async () => {
  for (const route of ["app/api/music/route.ts", "app/api/clothing/route.ts", "app/api/products/route.ts"]) {
    const f = fixture({ authorized: false });
    const handlers = f.load(route);
    for (const method of ["POST", "PUT", "DELETE"]) {
      if (!handlers[method]) continue;
      const response = await handlers[method](request(method, method === "DELETE" ? undefined : {}, "https://example.com/api?id=test"));
      assert.equal(response.status, 401);
    }
    assert.equal(f.state.updates.length, 0);
    assert.equal(f.state.queries.length, 0);
  }
});

test("admin lists retain hidden items and exclude deleted items", async () => {
  for (const [route, model] of [["app/api/admin/beats/route.ts", "beat"], ["app/api/admin/clothing/route.ts", "product"], ["app/api/admin/music-products/route.ts", "musicProduct"]]) {
    const f = fixture();
    const original = f.state.rows[model][0];
    f.state.rows[model].push({ ...original, id: "hidden", isPublished: false }, { ...original, id: "deleted", deletedAt: "test-date" });
    const response = await f.load(route).GET();
    const body = await response.json();
    const rows = body.beats || body;
    assert.deepEqual(rows.map((r) => r.id), [original.id, "hidden"]);
    assert.equal(rows[1].isPublished, false);
  }
});

test("public catalogue lists and homepage exclude hidden and deleted entries", async () => {
  for (const [route, model] of [["app/api/beats/route.ts", "beat"], ["app/api/clothing/route.ts", "product"], ["app/api/products/route.ts", "product"], ["app/api/music/route.ts", "musicProduct"], ["app/api/music/release/route.ts", "musicProduct"]]) {
    const f = fixture();
    const original = f.state.rows[model][0];
    f.state.rows[model].push({ ...original, id: "hidden", isPublished: false }, { ...original, id: "deleted", deletedAt: "test-date" });
    const response = await f.load(route).GET(new NextRequest("https://example.com/api"));
    assert.equal(response.status, 200, route);
    assert.equal((await response.json()).length, 1, route);
  }
  const f = fixture();
  for (const model of Object.keys(f.state.rows)) f.state.rows[model][0].isPublished = false;
  const response = await f.load("app/api/homepage/route.ts").GET();
  assert.deepEqual(await response.json(), { beats: [], music: [], clothing: [] });
});

test("direct detail URLs return 404 for hidden or deleted catalogue entries", async () => {
  for (const flags of [{ isPublished: false }, { deletedAt: "test-date" }]) {
    for (const [route, model, id] of [["app/api/beats/[id]/route.ts", "beat", "beat-1"], ["app/api/clothing/[id]/route.ts", "product", "clothing-1"], ["app/api/music/release/[id]/route.ts", "musicProduct", "release-1"], ["app/api/music/[id]/route.ts", "musicProduct", "music-1"]]) {
      const f = fixture(); Object.assign(f.state.rows[model][0], flags);
      const response = await f.load(route).GET(new NextRequest("https://example.com/api"), { params: Promise.resolve({ id }) });
      assert.equal(response.status, 404, route);
    }
  }
});

test("search only returns public catalogue entries", async () => {
  const f = fixture();
  for (const rows of Object.values(f.state.rows)) rows[0].isPublished = false;
  const results = await f.load("lib/siteSearch.ts").searchSite("unique test query");
  assert.equal(results.results.length, 0);
  assert.equal(results.incomplete, false);
  assert.equal(f.state.queries.length, 3);
});

test("old carts cannot buy hidden or deleted beats, clothing, albums or individual songs", async () => {
  for (const flags of [{ isPublished: false }, { deletedAt: "test-date" }]) {
    for (const [model, item] of [["beat", { id: "beat-1", type: "beat", licenseId: "license-1" }], ["product", { id: "clothing-1", type: "clothing" }], ["musicProduct", { id: "music-1", type: "music" }], ["musicProduct", { id: "song-1", songId: "song-1", type: "music", purchaseType: "track" }]]) {
      const f = fixture(); Object.assign(f.state.rows[model][0], flags);
      const response = await f.load("app/api/checkout/create-session/route.ts").POST(request("POST", { cart: [{ ...item, title: "Test", price: 0.01, quantity: 1 }] }));
      assert.equal(response.status, 400, JSON.stringify(item));
      assert.equal(f.state.orderCalls.length, 0);
      assert.equal(f.state.checkoutCalls.length, 0);
    }
  }
});

test("visible catalogue items still create checkout with server prices", async () => {
  for (const [item, expectedPrice] of [[{ id: "beat-1", type: "beat", licenseId: "license-1" }, 1000], [{ id: "music-1", type: "music" }, 300], [{ id: "clothing-1", type: "clothing", variantId: "variant-1" }, 2000], [{ id: "song-1", songId: "song-1", type: "music", purchaseType: "track" }, 100]]) {
    const f = fixture();
    const response = await f.load("app/api/checkout/create-session/route.ts").POST(request("POST", { cart: [{ ...item, title: "Test", price: 0.01, quantity: 1 }] }));
    assert.equal(response.status, 200, JSON.stringify(item));
    assert.equal(f.state.orderCalls.length, 1);
    assert.equal(f.state.checkoutCalls.length, 1);
    assert.equal(f.state.checkoutCalls[0].line_items[0].price_data.unit_amount, expectedPrice);
  }
});

test("legacy checkout routes and free downloads reject hidden catalogue entries", async () => {
  const f = fixture(); f.state.rows.beat[0].isPublished = false; f.state.rows.musicProduct[0].isPublished = false;
  const beatResponse = await f.load("app/api/checkout/beat-license/route.ts").POST(request("POST", { beatId: "beat-1", licenseId: "license-1" }));
  assert.equal(beatResponse.status, 404);
  const musicResponse = await f.load("app/api/checkout/music/route.ts").POST(request("POST", { trackId: "song-1", price: 0.01 }));
  assert.equal(musicResponse.status, 404);
  const freeResponse = await f.load("app/api/beats/[id]/free-download/route.ts").POST(request("POST", { email: "test@example.com" }), { params: Promise.resolve({ id: "beat-1" }) });
  assert.equal(freeResponse.status, 404);
  assert.equal(f.state.checkoutCalls.length, 0);
});
