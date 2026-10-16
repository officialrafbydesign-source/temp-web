const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { NextResponse } = require("next/server");
const root = path.resolve(__dirname, "..");
const plain = (value) => JSON.parse(JSON.stringify(value));
function load(name, mocks = {}, globals = {}) {
  const source = fs.readFileSync(path.join(root, name), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: (id) => id in mocks ? mocks[id] : require(id), URL, console: { error() {} }, ...globals });
  return module.exports;
}
const bpm = load("lib/beatBpm.ts");
const storeOrder = load("lib/beatStoreOrder.ts");

test("decimal BPM is preserved and missing tempos remain optional", () => {
  for (const value of [92.5, "92.5", " 128.125 ", 140]) assert.equal(bpm.parseBeatBpm(value), Number(value));
  for (const value of [null, undefined, "", "  ", 0, "0"]) assert.equal(bpm.parseBeatBpm(value), null);
});
test("invalid tempos cannot be rounded or silently stored as another number", () => {
  for (const value of [-1, Infinity, NaN, "92bpm", "92,5", "abc", true, [], {}]) assert.throws(() => bpm.parseBeatBpm(value), /BPM must be/);
});

function apiFixture(authorized = true) {
  const writes = [];
  const create = async ({ data }) => {
    writes.push(plain(data));
    return { ...data, id: "new-beat", licenses: (data.licenses?.create || []).map((license, i) => ({ ...license, id: `lic-${i}` })), downloadLogs: [] };
  };
  const prisma = {
    beat: { create, update: async ({ data }) => { writes.push(plain(data)); return { id: "beat-1", ...data }; }, findUnique: async () => ({ id: "source", bpm: 92.75, isAvailable: true, licenses: [], tags: [] }) },
    $transaction: (operations) => Promise.all(operations),
  };
  const mocks = {
    "@/lib/prisma": { prisma }, "@/lib/beatBpm": bpm, "@/lib/beatStoreOrder": storeOrder,
    "@/lib/adminApi": { authorizeAdminApi: async () => authorized ? { authorized: true } : { authorized: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } },
    "@/lib/catalogueVisibility": { PUBLIC_CATALOGUE_WHERE: { isPublished: true, deletedAt: null }, isPublicCatalogueItem: () => true },
  };
  return { writes, route: (name) => load(name, mocks) };
}
const request = (body, method = "POST") => new Request("https://example.com/api/beats", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
for (const name of ["app/api/admin/beats/route.ts", "app/api/beats/route.ts"]) {
  test(`${name} preserves a decimal BPM on creation`, async () => {
    const f = apiFixture();
    const response = await f.route(name).POST(request({ title: "Decimal tempo", bpm: "92.75", standardFileUrl: "untagged/audio.mp3", zipUrl: "exclusive/stems.zip" }));
    assert.ok(response.ok);
    assert.equal(f.writes[0].bpm, 92.75);
    const data = await response.json();
    assert.equal((data.beat || data).bpm, 92.75);
  });
  test(`${name} rejects invalid BPM before creating a beat`, async () => {
    const f = apiFixture();
    assert.equal((await f.route(name).POST(request({ title: "Invalid", bpm: "92oops" }))).status, 400);
    assert.equal(f.writes.length, 0);
  });
}
test("duplicating a beat preserves its decimal tempo and licence file mapping", async () => {
  const f = apiFixture();
  const response = await f.route("app/api/admin/beats/route.ts").POST(request({ duplicateSourceId: "source", title: "Copy", bpm: 92.75, standardFileUrl: "untagged/audio.mp3", zipUrl: "exclusive/stems.zip" }));
  assert.equal(response.status, 201);
  assert.equal(f.writes[0].bpm, 92.75);
  assert.equal(f.writes[0].licenses.create[0].fileUrl, "untagged/audio.mp3");
  assert.equal(f.writes[0].licenses.create[1].fileUrl, "exclusive/stems.zip");
});
for (const [name, method] of [["app/api/admin/beats/bulk-upload/route.ts", "POST"], ["app/api/admin/beats/bulk-update/route.ts", "PUT"]]) {
  test(`${method} ${name} keeps decimals and separate paid files`, async () => {
    const f = apiFixture();
    const response = await f.route(name)[method](request({ beats: [{ id: "beat-1", title: "Decimal tempo", bpm: "128.125", tags: ["Soul"], standardFileUrl: "untagged/audio.mp3", zipUrl: "exclusive/stems.zip" }] }, method));
    assert.ok(response.ok);
    assert.equal(f.writes[0].bpm, 128.125);
    const licenses = method === "PUT" ? f.writes[0].licenses.updateMany.map((item) => item.data) : f.writes[0].licenses.create;
    assert.equal(licenses[0].fileUrl, "untagged/audio.mp3");
    assert.equal(licenses[1].fileUrl, "exclusive/stems.zip");
  });
  test(`${name} validates the whole batch before constructing writes`, async () => {
    const f = apiFixture();
    assert.equal((await f.route(name)[method](request({ beats: [{ id: "valid", bpm: 92.5 }, { id: "invalid", bpm: -1 }] }, method))).status, 400);
    assert.equal(f.writes.length, 0);
  });
  test(`${name} remains restricted to admins`, async () => {
    const f = apiFixture(false);
    assert.equal((await f.route(name)[method](request({ beats: [{ bpm: 92.5 }] }, method))).status, 401);
    assert.equal(f.writes.length, 0);
  });
}

const actions = ({ onDeleted, onVisibilityChange }) => React.createElement("div", {},
  React.createElement("button", { onClick: () => onVisibilityChange(false) }, "Hide from shop"),
  React.createElement("button", { onClick: onDeleted }, "Delete"));
const tagsInput = ({ label }) => React.createElement("input", { "aria-label": label });
const InventoryItem = load("app/admin/components/BeatInventoryItem.tsx", {
  "./CatalogueActions": { default: actions }, "./CatalogueTagsInput": { default: tagsInput },
}).default;
const beat = { id: "beat-1", title: "Decimal Beat", bpm: 92.75, genre: "Instrumental", musicalKey: "C Minor", tags: ["Dark Piano"], priceStandard: 29.99, pricePremium: 79.99, standardFileUrl: "untagged/audio.mp3", zipUrl: "exclusive/stems.zip", mp3Url: "https://example.com/preview.mp3", freeDownload: false, plays: 10, downloads: 1 };
function itemProps(expanded) {
  return { beat, expanded, selected: true, busy: false, playing: false, existingTags: ["Dark Piano"], selectedCount: 1, preview: null, onSelect() {}, onExpand() {}, onPlay() {}, onSave() {}, onDuplicate() {}, onDeleted() {}, onVisibilityChange() {}, onChange() {}, onChooseImage() {} };
}
test("compact rows show tempo, tags and all main actions without the editing panels", () => {
  const html = renderToStaticMarkup(React.createElement(InventoryItem, itemProps(false)));
  for (const label of ["92.75", "Dark Piano", "Play", "Edit / Expand", "Duplicate", "Hide from shop", "Delete"]) assert.ok(html.includes(label), label);
  assert.doesNotMatch(html, /Audio and downloads|overflow-x-auto|<table/);
});
test("expanded rows expose decimal BPM, licence paths, image tools and save controls", () => {
  const html = renderToStaticMarkup(React.createElement(InventoryItem, itemProps(true)));
  assert.match(html, /step="any"[^>]*value="92\.75"|value="92\.75"[^>]*step="any"/);
  for (const label of ["untagged/audio.mp3", "exclusive/stems.zip", "Foreground image URL", "Background image URL", "Choose front", "Upload background", "Save selected changes (1)", "Hide from shop", "Delete"]) assert.ok(html.includes(label), label);
  assert.doesNotMatch(html, /overflow-x-auto|<table/);
});

function find(tree, predicate) {
  if (!tree || typeof tree !== "object") return null;
  if (predicate(tree)) return tree;
  for (const child of React.Children.toArray(tree.props?.children)) { const match = find(child, predicate); if (match) return match; }
  return null;
}
const Pagination = () => null;
function inventoryFixture(catalogue = [beat]) {
  const state = [catalogue, false];
  let cursor = 0;
  const sent = [];
  const hooks = { ...React, useState(initial) {
    const index = cursor++;
    if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial;
    return [state[index], (next) => { state[index] = typeof next === "function" ? next(state[index]) : next; }];
  }, useEffect() {}, useRef: (value) => ({ current: value }), useCallback: (fn) => fn };
  const page = load("app/admin/beats/page.tsx", {
    react: hooks, "next/script": { default: () => null }, "../components/AdminLayout": { default: ({ children }) => React.createElement("div", {}, children) },
    "../components/BeatStoreOrder": { default: () => null }, "../components/InventoryPagination": { default: Pagination }, "../components/BeatInventoryItem": { default: InventoryItem }, "../components/CatalogueTagsInput": { default: tagsInput },
    "@/lib/catalogueTags": { normaliseTags: (tags) => tags },
  }, { alert() {}, fetch: async (url, options) => { sent.push({ url, body: JSON.parse(options.body) }); return { ok: true }; } });
  const render = () => { cursor = 0; return page.default(); };
  const row = (tree) => find(tree, (node) => node.type === InventoryItem);
  const button = (tree, label) => find(tree, (node) => node.type === "button" && node.props.children === label);
  return { render, row, button, sent, pagination: (tree) => find(tree, (node) => node.type === Pagination) };
}
test("expanding selects the beat; switching views preserves edits and saves decimal BPM", async () => {
  const f = inventoryFixture();
  let tree = f.render();
  assert.equal(f.row(tree).props.expanded, false);
  f.row(tree).props.onExpand();
  tree = f.render();
  assert.equal(f.row(tree).props.expanded, true);
  assert.equal(f.row(tree).props.selected, true);
  f.row(tree).props.onChange("bpm", 128.125);
  tree = f.render();
  f.button(tree, "Expanded view").props.onClick();
  tree = f.render();
  assert.equal(f.row(tree).props.beat.bpm, 128.125);
  f.button(tree, "Compact view").props.onClick();
  tree = f.render();
  assert.equal(f.row(tree).props.expanded, false);
  assert.equal(f.row(tree).props.beat.bpm, 128.125);
  assert.equal(f.row(tree).props.selected, true);
  await f.row(tree).props.onSave();
  assert.equal(f.sent[0].url, "/api/admin/beats/bulk-update");
  assert.equal(f.sent[0].body.beats[0].bpm, 128.125);
  assert.equal(f.sent[0].body.beats[0].standardFileUrl, beat.standardFileUrl);
});
test("searching filters the inventory without dropping selected unsaved edits", () => {
  const f = inventoryFixture();
  let tree = f.render();
  f.row(tree).props.onExpand();
  tree = f.render();
  f.row(tree).props.onChange("bpm", 104.5);
  const search = () => find(tree, (node) => node.type === "input" && node.props.type === "search");
  search().props.onChange({ target: { value: "No match" } });
  tree = f.render();
  assert.equal(f.row(tree), null);
  search().props.onChange({ target: { value: "Dark Piano" } });
  tree = f.render();
  assert.equal(f.row(tree).props.beat.bpm, 104.5);
  assert.equal(f.row(tree).props.selected, true);
});

test("jumping between inventory pages retains selected edits for the final save", async () => {
  const catalogue = Array.from({ length: 27 }, (_, index) => ({ ...beat, id: `beat-${index + 1}`, title: `Beat ${String(index + 1).padStart(2, "0")}` }));
  const f = inventoryFixture(catalogue);
  let tree = f.render();
  assert.equal(f.pagination(tree).props.totalPages, 2);
  assert.equal(f.pagination(tree).props.totalItems, 27);
  f.row(tree).props.onExpand();
  tree = f.render();
  f.row(tree).props.onChange("bpm", 91.25);
  tree = f.render();
  f.pagination(tree).props.onChange(2);
  tree = f.render();
  assert.equal(f.row(tree).props.beat.id, "beat-25");
  assert.equal(f.pagination(tree).props.currentPage, 2);
  await f.row(tree).props.onSave();
  assert.equal(f.sent[0].body.beats.length, 1);
  assert.equal(f.sent[0].body.beats[0].id, "beat-1");
  assert.equal(f.sent[0].body.beats[0].bpm, 91.25);
});
