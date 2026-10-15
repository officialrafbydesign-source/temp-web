const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { NextResponse } = require("next/server");
const root = path.resolve(__dirname, "..");

function load(name, mocks = {}) {
  const source = fs.readFileSync(path.join(root, name), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: (id) => id in mocks ? mocks[id] : require(id), console: { ...console, error() {} } });
  return module.exports;
}
const { normaliseTags, suggestTags } = load("lib/catalogueTags.ts");
const plain = (value) => JSON.parse(JSON.stringify(value));

test("reusing a tag keeps existing catalogue spelling without duplicate case variants", () => {
  assert.deepEqual(plain(normaliseTags(["trap", "TRAP", "  dark   piano ", "New Tag"], ["Trap", "Dark Piano"])), ["Trap", "Dark Piano", "New Tag"]);
});

test("blank entries are removed and clearing all tags stays empty", () => {
  assert.deepEqual(plain(normaliseTags([" ", "", "  Soul  "])), ["Soul"]);
  assert.deepEqual(plain(normaliseTags([], ["Trap"])), []);
});

test("suggestions match without case, exclude selected tags and deduplicate catalogue entries", () => {
  assert.deepEqual(plain(suggestTags(["Trap", "trap", "Dark Piano", "Piano", "Soul"], ["PIANO"], "pIa")), ["Dark Piano"]);
});

test("suggestions are limited and new tags remain available to create", () => {
  const tags = Array.from({ length: 20 }, (_, i) => `Tag ${i}`);
  assert.equal(suggestTags(tags, [], "").length, 8);
  assert.deepEqual(plain(suggestTags(tags, [], "Brand new")), []);
  assert.deepEqual(plain(normaliseTags(["Brand new"], tags)), ["Brand new"]);
});

function saveFixture(authorized = true) {
  const saved = [];
  const prisma = {
    beat: { update: (args) => { saved.push(args); return Promise.resolve({}); } },
    $transaction: (calls) => Promise.all(calls),
  };
  const route = load("app/api/admin/beats/bulk-update/route.ts", {
    "@/lib/prisma": { prisma },
    "@/lib/adminApi": { authorizeAdminApi: async () => authorized
      ? { authorized: true }
      : { authorized: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } },
  });
  return { saved, route };
}

function request(tags) {
  return new Request("https://example.com/api/admin/beats/bulk-update", {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ beats: [{ id: "selected-beat", tags, mp3Url: "https://example.com/preview.mp3", standardFileUrl: "private/untagged.mp3", zipUrl: "private/exclusive.zip" }] }),
  });
}

test("the deployed save route persists edited tags on the selected beat", async () => {
  const f = saveFixture();
  const tags = plain(normaliseTags(["trap", "Soul"], ["Trap"]));
  assert.equal((await f.route.PUT(request(tags))).status, 200);
  assert.equal(f.saved.length, 1);
  assert.equal(f.saved[0].where.id, "selected-beat");
  assert.deepEqual(plain(f.saved[0].data.tags), ["Trap", "Soul"]);
  assert.equal(f.saved[0].data.audioUrl, "https://example.com/preview.mp3");
  assert.equal(f.saved[0].data.licenses.updateMany[0].data.fileUrl, "private/untagged.mp3");
  assert.equal(f.saved[0].data.licenses.updateMany[1].data.fileUrl, "private/exclusive.zip");
});

test("the deployed save route can remove every tag", async () => {
  const f = saveFixture();
  assert.equal((await f.route.PUT(request([]))).status, 200);
  assert.deepEqual(plain(f.saved[0].data.tags), []);
});

test("tag edits cannot bypass administrator authorization", async () => {
  const f = saveFixture(false);
  assert.equal((await f.route.PUT(request(["Trap"]))).status, 401);
  assert.equal(f.saved.length, 0);
});

function clothingFixture({ authorized = true, exists = true, failure = false } = {}) {
  const product = {
    id: "shirt-1", name: "Shirt", price: 25, isPublished: true, deletedAt: null, tags: ["Streetwear"],
    variants: [{ id: "variant-1", size: "M", color: "Black", stock: 7, sku: "BLACK-M" }],
  };
  const writes = [];
  const prisma = {
    product: {
      updateMany: async (args) => {
        if (failure) throw new Error("Test database failure");
        writes.push(args);
        if (!exists) return { count: 0 };
        Object.assign(product, args.data);
        return { count: 1 };
      },
      findMany: async () => exists ? [product] : [],
    },
    productVariant: { deleteMany() { throw new Error("Tag edits must not replace variants"); } },
  };
  const route = load("app/api/admin/clothing/route.ts", {
    "@/lib/prisma": { prisma },
    "@/lib/catalogueTags": { normaliseTags },
    "@/lib/catalogueAdmin": { catalogueAdminAction() { throw new Error("Tag edits must not archive products"); } },
    "@/lib/adminApi": { authorizeAdminApi: async () => authorized
      ? { authorized: true }
      : { authorized: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } },
  });
  return { route, writes, product };
}

function clothingRequest(body) {
  return new Request("https://example.com/api/admin/clothing", {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}

test("clothing tag-only edits survive reload and preserve variants, stock, prices and visibility", async () => {
  const f = clothingFixture();
  const before = JSON.parse(JSON.stringify(f.product));
  const response = await f.route.PATCH(clothingRequest({ id: "shirt-1", tags: ["Streetwear", "streetwear", "  Hip Hop "], price: 0, variants: [] }));
  assert.equal(response.status, 200);
  assert.deepEqual(plain(f.writes[0].where), { id: "shirt-1", deletedAt: null });
  assert.deepEqual(Object.keys(f.writes[0].data), ["tags"]);
  assert.deepEqual(plain(f.product.tags), ["Streetwear", "Hip Hop"]);
  assert.deepEqual(plain(f.product), { ...before, tags: ["Streetwear", "Hip Hop"] });
  const [reloaded] = await (await f.route.GET()).json();
  assert.deepEqual(reloaded.tags, ["Streetwear", "Hip Hop"]);
  assert.deepEqual(reloaded.variants, before.variants);
});

test("clothing tags can all be removed", async () => {
  const f = clothingFixture();
  assert.equal((await f.route.PATCH(clothingRequest({ id: "shirt-1", tags: [] }))).status, 200);
  assert.deepEqual(plain(f.product.tags), []);
});

test("clothing tag edits require admin authorization and reject malformed tag lists", async () => {
  const blocked = clothingFixture({ authorized: false });
  assert.equal((await blocked.route.PATCH(clothingRequest({ id: "shirt-1", tags: [] }))).status, 401);
  assert.equal(blocked.writes.length, 0);
  const f = clothingFixture();
  for (const body of [null, {}, { id: "shirt-1", tags: "Streetwear" }, { id: "shirt-1", tags: [42] }]) {
    assert.equal((await f.route.PATCH(clothingRequest(body))).status, 400);
  }
  assert.equal(f.writes.length, 0);
});

test("missing or deleted clothing returns not found", async () => {
  const f = clothingFixture({ exists: false });
  assert.equal((await f.route.PATCH(clothingRequest({ id: "shirt-1", tags: ["Streetwear"] }))).status, 404);
});

test("clothing save failures do not report success", async () => {
  const f = clothingFixture({ failure: true });
  assert.equal((await f.route.PATCH(clothingRequest({ id: "shirt-1", tags: ["Streetwear"] }))).status, 500);
});
