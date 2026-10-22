const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { NextRequest, NextResponse } = require("next/server");
const root = path.resolve(__dirname, "..");

function load(relativePath, prisma, authorized = true) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  const requireMock = (name) => {
    if (name === "@/lib/beatStoreOrder") return load("lib/beatStoreOrder.ts", prisma, authorized);
    if (name === "@/lib/beatBpmClient") return load("lib/beatBpmClient.ts", prisma, authorized);
    if (name === "@prisma/client") return { Prisma: { dmmf: { datamodel: { models: [{ name: "Beat", fields: [{ name: "bpm", type: "Float" }] }] } } } };
    if (name === "@/lib/beatBpm") return load("lib/beatBpm.ts", prisma, authorized);
    if (name === "@/lib/prisma") return { prisma };
    if (name === "@/lib/adminApi") return { authorizeAdminApi: async () => authorized
      ? { authorized: true }
      : { authorized: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } };
    if (name === "@/lib/catalogueVisibility") return {
      PUBLIC_CATALOGUE_WHERE: { isPublished: true, deletedAt: null },
      isPublicCatalogueItem: () => true,
    };
    return require(name);
  };
  vm.runInNewContext(code, { module, exports: module.exports, require: requireMock, URL, console });
  return module.exports;
}

function editRequest(beat) {
  return new Request("https://example.com/api/admin/beats/bulk-update", {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ beats: [beat] }),
  });
}

test("background edits save the displayed field and preserve separate licence downloads", async () => {
  let saved;
  const prisma = { beat: { update: (args) => { saved = args; return Promise.resolve({}); } }, $transaction: (calls) => Promise.all(calls) };
  const response = await load("app/api/admin/beats/bulk-update/route.ts", prisma).PUT(editRequest({
    id: "beat-1", backgroundUrl: "https://example.com/new.jpg", backgroundImage: "https://example.com/old.jpg",
    artworkUrl: "https://example.com/front.png", mp3Url: "https://example.com/tagged.mp3",
    standardFileUrl: "beats/one/standard.zip", zipUrl: "beats/one/stems.zip", priceStandard: 29.99, pricePremium: 79.99,
  }));
  assert.equal(response.status, 200);
  assert.equal(saved.data.backgroundImage, "https://example.com/new.jpg");
  assert.equal(saved.data.artworkUrl, "https://example.com/front.png");
  assert.equal(saved.data.audioUrl, "https://example.com/tagged.mp3");
  assert.equal(saved.data.licenses.updateMany[0].data.fileUrl, "beats/one/standard.zip");
  assert.equal(saved.data.licenses.updateMany[1].data.fileUrl, "beats/one/stems.zip");
});

test("clearing a background does not restore a stale backgroundImage value", async () => {
  let saved;
  const prisma = { beat: { update: (args) => { saved = args; return Promise.resolve({}); } }, $transaction: (calls) => Promise.all(calls) };
  await load("app/api/admin/beats/bulk-update/route.ts", prisma).PUT(editRequest({
    id: "beat-1", backgroundUrl: "", backgroundImage: "https://example.com/old.jpg",
  }));
  assert.equal(saved.data.backgroundImage, null);
});

test("the older backgroundImage field is still accepted", async () => {
  let saved;
  const prisma = { beat: { update: (args) => { saved = args; return Promise.resolve({}); } }, $transaction: (calls) => Promise.all(calls) };
  await load("app/api/admin/beats/bulk-update/route.ts", prisma).PUT(editRequest({ id: "beat-1", backgroundImage: "https://example.com/old.jpg" }));
  assert.equal(saved.data.backgroundImage, "https://example.com/old.jpg");
});

test("image edits remain protected by administrator authorization", async () => {
  const prisma = { beat: { update() { throw new Error("Must not write"); } } };
  assert.equal((await load("app/api/admin/beats/bulk-update/route.ts", prisma, false).PUT(editRequest({ id: "beat-1" }))).status, 401);
});

test("the public shop receives card images without receiving paid download paths", async () => {
  const beat = {
    id: "beat-1", title: "Beat", artworkUrl: "https://example.com/front.png", backgroundImage: "https://example.com/bg.jpg",
    audioUrl: "https://example.com/tagged.mp3", fileUrl: "private/stems.zip", freeDownload: true,
    licenses: [{ price: 2999, fileUrl: "private/standard.zip" }], tags: [],
  };
  for (const suffix of ["", "?page=1&limit=12"]) {
    const prisma = { beat: { findMany: async (args) => {
      assert.equal(args.where.isPublished, true);
      assert.equal(args.where.deletedAt, null);
      return [beat];
    } } };
    const response = await load("app/api/beats/route.ts", prisma).GET(new NextRequest("https://example.com/api/beats" + suffix));
    const [item] = await response.json();
    assert.equal(item.artworkUrl, beat.artworkUrl);
    assert.equal(item.backgroundUrl, beat.backgroundImage);
    assert.equal(item.audioUrl, beat.audioUrl);
    assert.equal(item.fileUrl, beat.audioUrl);
    assert.ok(!JSON.stringify(item).includes("private/"));
  }
});

function mediaLibraryFixture(env, cloudinary) {
  // Execute the actual callback from the page, avoiding browser or provider calls.
  const text = fs.readFileSync(path.join(root, "app/admin/beats/page.tsx"), "utf8");
  const tree = ts.createSourceFile("page.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let initializer;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(tree) === "openCloudinaryMediaLibrary") initializer = node.initializer.getText(tree);
    ts.forEachChild(node, visit);
  }
  visit(tree);
  assert.ok(initializer);
  const code = ts.transpileModule("module.exports = " + initializer, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const alerts = [];
  const module = { exports: {} };
  vm.runInNewContext(code, { module, mediaCallback: { current: null }, mediaLibrary: { current: null }, window: { cloudinary }, process: { env }, alert: (message) => alerts.push(message) });
  return { open: module.exports, alerts };
}

test("Cloudinary opens without an API key and inserts the selected image", () => {
  let selected;
  const f = mediaLibraryFixture({ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "test-cloud" }, {
    openMediaLibrary(config, handlers) {
      assert.equal(config.cloud_name, "test-cloud");
      assert.equal("api_key" in config, false);
      handlers.insertHandler({ assets: [{ secure_url: "https://example.com/image.png" }] });
    },
  });
  f.open((url) => { selected = url; });
  assert.equal(f.alerts.length, 0);
  assert.equal(selected, "https://example.com/image.png");
});

test("a loaded upload widget does not masquerade as a loaded Media Library", () => {
  const f = mediaLibraryFixture({ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "test-cloud" }, { openUploadWidget() {} });
  assert.doesNotThrow(() => f.open(() => {}));
  assert.match(f.alerts[0], /still loading/);
});
