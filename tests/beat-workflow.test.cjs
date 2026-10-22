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
  const code = ts.transpileModule(fs.readFileSync(path.join(root, name), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: (id) => id in mocks ? mocks[id] : require(id), URL, URLSearchParams, Buffer, AbortSignal, console: { error() {} }, ...globals });
  return module.exports;
}
const order = load("lib/beatStoreOrder.ts");
const assets = load("lib/beatAssetImages.ts");
function nodes(tree, predicate) {
  if (!tree || typeof tree !== "object") return [];
  return [...(predicate(tree) ? [tree] : []), ...React.Children.toArray(tree.props?.children).flatMap((child) => nodes(child, predicate))];
}
function runtime(initial = []) {
  const values = [...initial]; let cursor = 0;
  return { hooks: { ...React, useMemo: (fn) => fn(), useCallback: (fn) => fn, useEffect() {}, useRef(initial) { const index = cursor++; if (!(index in values)) values[index] = { current: initial }; return values[index]; },
    useState(initial) { const index = cursor++; if (!(index in values)) values[index] = typeof initial === "function" ? initial() : initial; return [values[index], (value) => { values[index] = typeof value === "function" ? value(values[index]) : value; }]; } },
    render(Component, props) { cursor = 0; return Component(props); } };
}
const make = (id, extra = {}) => ({ id, title: id.toUpperCase(), storeOrder: { a: 1, b: 2, c: 3, d: 4 }[id], bpm: 92.5, musicalKey: "Am", isPublished: true, isAvailable: true, ...extra });
const beats = [make("a"), make("b", { isPublished: false }), make("c"), make("d")];

test("group moves use final absolute positions and preserve catalogue-relative order", () => {
  const ids = ["a", "b", "c", "d", "e"];
  assert.deepEqual(plain(order.moveBeatGroup(ids, ["d", "b"], 1)), ["b", "d", "a", "c", "e"]);
  assert.deepEqual(plain(order.moveBeatGroup(ids, ["b", "d"], 4)), ["a", "c", "e", "b", "d"]);
  assert.deepEqual(plain(order.moveBeatsBeside(ids, ["b", "d"], "c", "after")), ["a", "c", "b", "d", "e"]);
  assert.deepEqual(plain(order.moveBeatsBeside(ids, ["a"], "e", "after")), ["b", "c", "d", "e", "a"]);
  for (const value of [0, -1, 9, 1.5, NaN]) assert.deepEqual(plain(order.moveBeatGroup(ids, ["b"], value)), ids);
  assert.deepEqual(plain(order.moveBeatsBeside(ids, ["b"], "b", "before")), ids);
});
test("undo/redo restores complete moves and a new move discards the redo branch", () => {
  const first = { past: [], present: ["a", "b", "c"], future: [] };
  const second = order.changeBeatOrder(first, ["c", "a", "b"]);
  const undone = order.undoBeatOrder(second);
  assert.deepEqual(plain(undone.present), first.present);
  assert.deepEqual(plain(order.redoBeatOrder(undone).present), ["c", "a", "b"]);
  assert.deepEqual(plain(order.changeBeatOrder(undone, ["b", "a", "c"]).future), []);
});
function workspaceFixture(fetcher = async () => ({ ok: false, json: async () => ({ error: "Could not save" }) })) {
  const r = runtime(); const saves = [];
  const Component = load("app/admin/components/BeatOrderWorkspace.tsx", { react: r.hooks, "@/lib/beatStoreOrder": order, "@/lib/beatAssetImages": assets }, { fetch: fetcher }).default;
  const props = { beats, onSaved: (items) => saves.push(items) };
  const render = () => r.render(Component, props);
  const button = (tree, label) => nodes(tree, (n) => n.type === "button" && n.props.children === label)[0];
  const listIds = (tree, label) => {
    const list = nodes(tree, (n) => n.type === "ol" && n.props["aria-label"] === label)[0];
    return React.Children.toArray(list.props.children).filter((n) => n.type === "li").map((n) => n.key.split("$").pop());
  };
  return { render, button, listIds, saves };
}
test("selecting a beat and moving it updates the full draft preview but preserves the saved comparison", () => {
  const f = workspaceFixture(); let tree = f.render();
  nodes(tree, (n) => n.type === "input" && n.props["aria-label"] === "Select D")[0].props.onChange();
  tree = f.render(); f.button(tree, "Move to top").props.onClick(); tree = f.render();
  assert.deepEqual(f.listIds(tree, "Catalogue order"), ["d", "a", "b", "c"]);
  assert.deepEqual(f.listIds(tree, "Draft storefront order"), ["d", "a", "c"]);
  f.button(tree, "Saved").props.onClick(); tree = f.render();
  assert.deepEqual(f.listIds(tree, "Saved storefront order"), ["a", "c", "d"]);
  f.button(tree, "Undo").props.onClick(); tree = f.render();
  assert.deepEqual(f.listIds(tree, "Draft storefront order"), ["a", "c", "d"]);
  f.button(tree, "Redo").props.onClick(); tree = f.render();
  assert.deepEqual(f.listIds(tree, "Draft storefront order"), ["d", "a", "c"]);
});
test("search narrows the move list without dropping hidden beats or changing the full preview", () => {
  const f = workspaceFixture(); let tree = f.render();
  nodes(tree, (n) => n.type === "input" && n.props.type === "search")[0].props.onChange({ target: { value: "D" } });
  tree = f.render();
  assert.deepEqual(f.listIds(tree, "Catalogue order"), ["d"]);
  assert.deepEqual(f.listIds(tree, "Draft storefront order"), ["a", "c", "d"]);
  f.button(tree, "Select matches").props.onClick(); tree = f.render(); f.button(tree, "Move to top").props.onClick();
  tree = f.render(); assert.deepEqual(f.listIds(tree, "Draft storefront order"), ["d", "a", "c"]);
});
test("a failed save retains the reordered draft; a successful save sends only IDs including hidden beats", async () => {
  for (const success of [false, true]) {
    const sent = [];
    const f = workspaceFixture(async (url, options) => { sent.push({ url, method: options.method, body: JSON.parse(options.body) }); return { ok: success, json: async () => success ? { success: true, items: [{ id: "d", storeOrder: 1 }] } : { error: "Could not save" } }; });
    let tree = f.render(); nodes(tree, (n) => n.props?.["aria-label"] === "Move D up")[0].props.onClick(); tree = f.render();
    await f.button(tree, "Save store order").props.onClick(); tree = f.render();
    assert.deepEqual(sent, [{ url: "/api/admin/beats/order", method: "PATCH", body: { ids: ["a", "b", "d", "c"] } }]);
    assert.deepEqual(f.listIds(tree, "Draft storefront order"), ["a", "d", "c"]);
    assert.equal(f.saves.length, success ? 1 : 0);
    if (!success) assert.equal(nodes(tree, (n) => n.props?.role === "alert")[0].props.children, "Could not save");
  }
});
test("dragging one selected beat moves the selection together before the drop target", () => {
  const f = workspaceFixture(); let tree = f.render();
  for (const title of ["C", "D"]) { nodes(tree, (n) => n.props?.["aria-label"] === `Select ${title}`)[0].props.onChange(); tree = f.render(); }
  const handles = nodes(tree, (n) => n.props?.draggable === true);
  handles[2].props.onDragStart({ dataTransfer: { setData() {} } }); tree = f.render();
  nodes(tree, (n) => n.type === "li" && n.props["data-beat-id"] === "a")[0].props.onDrop({ preventDefault() {} }); tree = f.render();
  assert.deepEqual(f.listIds(tree, "Catalogue order"), ["c", "d", "a", "b"]);
});
test("the order editor renders full-width and separate live draft/saved view controls", () => {
  const Component = load("app/admin/components/BeatOrderWorkspace.tsx", { "@/lib/beatStoreOrder": order, "@/lib/beatAssetImages": assets }).default;
  const html = renderToStaticMarkup(React.createElement(Component, { beats, onSaved() {} }));
  for (const label of ["Move to top", "Move to bottom", "Move beside beat", "Full-width list", "Full-width preview", "Undo", "Redo", "Show full list"]) assert.ok(html.includes(label));
  assert.match(html, /Hidden and unavailable beats are omitted/);
});

const env = { NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "test-cloud", CLOUDINARY_API_KEY: "server-key", CLOUDINARY_API_SECRET: "server-secret" };
const resource = (name, extra = {}) => ({ asset_id: name, public_id: name, resource_type: "image", type: "upload", secure_url: `https://res.cloudinary.com/test-cloud/image/upload/v1/${name}.png`, ...extra });
const request = (query = "folder=backgrounds") => new Request(`https://example.com/api/admin/beats/assets?${query}`);
function apiFixture({ authorized = true, config = env, provider = async () => ({ ok: true, json: async () => ({ resources: [resource("one")] }) }) } = {}) {
  const sent = [];
  const route = load("app/api/admin/beats/assets/route.ts", { "@/lib/adminApi": { authorizeAdminApi: async () => authorized ? { authorized: true } : { authorized: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } }, "@/lib/beatAssetImages": assets }, { process: { env: config }, fetch: async (url, options) => { sent.push({ url: new URL(url), options }); return provider(url, options); } });
  return { route, sent };
}
test("asset listing authenticates admins and restricts requests to the two configured folders", async () => {
  const denied = apiFixture({ authorized: false }); assert.equal((await denied.route.GET(request())).status, 401); assert.equal(denied.sent.length, 0);
  const f = apiFixture(); for (const q of ["folder=other", "folder=../../private", "folder=logos&mode=bogus"]) assert.equal((await f.route.GET(request(q))).status, 400);
  assert.equal(f.sent.length, 0);
});
test("asset listing returns only public images and never leaks credentials or provider metadata", async () => {
  const f = apiFixture({ provider: async () => ({ ok: true, json: async () => ({ resources: [resource("one"), resource("video", { resource_type: "video" }), resource("private", { type: "authenticated" }), resource("restricted", { access_control: [{ access_type: "token" }] })], next_cursor: "next-page" }) }) });
  const response = await f.route.GET(request()); const data = await response.json();
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(data.images.length, 1); assert.equal(data.images[0].url, resource("one").secure_url);
  assert.equal(data.nextCursor, "folder:next-page"); assert.equal(data.folderPath, "Background Beats");
  assert.match(data.images[0].thumbnail, /w_240/); assert.doesNotMatch(JSON.stringify(data), /server-key|server-secret|access_control/);
  assert.equal(f.sent[0].url.searchParams.get("asset_folder"), "Background Beats");
  assert.equal(f.sent[0].options.headers.Authorization, `Basic ${Buffer.from("server-key:server-secret").toString("base64")}`);
});
test("fixed folder accounts fall back to prefix listing and keep that mode for later pages", async () => {
  const f = apiFixture({ provider: async (url) => new URL(url).pathname.endsWith("by_asset_folder") ? { ok: false, status: 400 } : { ok: true, json: async () => ({ resources: [resource("Logos/one")], next_cursor: "page-2" }) } });
  const data = await (await f.route.GET(request("folder=logos"))).json();
  assert.equal(data.nextCursor, "prefix:page-2"); assert.equal(f.sent[1].url.searchParams.get("prefix"), "Logos/");
  await f.route.GET(request("folder=logos&mode=prefix&cursor=page-2"));
  assert.equal(f.sent[2].url.searchParams.get("next_cursor"), "page-2"); assert.ok(f.sent[2].url.pathname.endsWith("image/upload"));
});
test("provider auth and rate-limit errors stay readable and do not trigger a second provider request", async () => {
  for (const status of [401, 403, 429]) {
    const f = apiFixture({ provider: async () => ({ ok: false, status }) });
    const response = await f.route.GET(request());
    assert.equal(response.status, status === 429 ? 429 : 502); assert.equal(f.sent.length, 1);
    assert.doesNotMatch(JSON.stringify(await response.json()), /server-secret/);
  }
});
test("missing credentials have a full-library fallback and never call Cloudinary", async () => {
  const f = apiFixture({ config: {} }); const response = await f.route.GET(request());
  assert.equal(response.status, 503); assert.equal(f.sent.length, 0); assert.match((await response.json()).error, /full library/);
});
test("repeated folder loads use the short server cache; Refresh requests fetch new choices", async () => {
  const f = apiFixture(); await f.route.GET(request()); await f.route.GET(request()); assert.equal(f.sent.length, 1);
  await f.route.GET(request("folder=backgrounds&refresh=1")); assert.equal(f.sent.length, 2);
});
test("client folder cache reuses results across beats, sends cursor mode and refreshes on demand", async () => {
  const sent = [];
  const picker = load("app/admin/components/BeatAssetPicker.tsx", { "react-dom": { createPortal() {} } }, { fetch: async (url) => { sent.push(url); return { ok: true, json: async () => ({ images: [resource("one")], nextCursor: null, folderPath: "Logos" }) }; } });
  await picker.loadBeatAssetPage("logos"); await picker.loadBeatAssetPage("logos"); assert.equal(sent.length, 1);
  await picker.loadBeatAssetPage("logos", "prefix:next+page");
  const params = new URL(sent[1], "https://example.com").searchParams;
  assert.equal(params.get("mode"), "prefix"); assert.equal(params.get("cursor"), "next+page");
  await picker.loadBeatAssetPage("logos", "", true); assert.equal(sent.length, 3); assert.match(sent[2], /refresh=1/);
});
test("intake, row and bulk artwork choices all open quick folders without saving automatically", () => {
  const catalogue = beats.map((beat) => ({ ...beat, tags: [], plays: 0, downloads: 0, artworkUrl: "", backgroundUrl: "" }));
  const r = runtime([catalogue, false]);
  const Picker = () => null, Row = () => null, Pagination = () => null;
  const page = load("app/admin/beats/page.tsx", { react: r.hooks, "next/script": { default: () => null }, "../components/AdminLayout": { default: () => null }, "../components/BeatEditorsPickButton": { default: () => null }, "../components/BeatAssetPicker": { default: Picker }, "../components/BeatInventoryItem": { default: Row }, "../components/InventoryPagination": { default: Pagination }, "../components/CatalogueTagsInput": { default: () => null }, "@/lib/catalogueTags": { normaliseTags: (tags) => tags } }).default;
  let tree = r.render(page);
  const choose = nodes(tree, (n) => n.type === "button" && React.Children.toArray(n.props.children).join("").includes("Choose From"))[0];
  choose.props.onClick(); tree = r.render(page);
  assert.equal(nodes(tree, (n) => n.type === Picker)[0].props.initialFolder, "logos");
  nodes(tree, (n) => n.type === Picker)[0].props.onClose(); tree = r.render(page);
  nodes(tree, (n) => n.type === Row)[0].props.onChooseImage("backgroundUrl", false); tree = r.render(page);
  let picker = nodes(tree, (n) => n.type === Picker)[0];
  assert.equal(picker.props.initialFolder, "backgrounds");
  picker.props.onChoose("https://example.com/background.png"); tree = r.render(page);
  assert.equal(nodes(tree, (n) => n.type === Row)[0].props.beat.backgroundUrl, "https://example.com/background.png");
  nodes(tree, (n) => n.type === Row)[0].props.onSelect(); tree = r.render(page);
  nodes(tree, (n) => n.type === "button" && React.Children.toArray(n.props.children).join("").includes("Choose Front"))[0].props.onClick();
  tree = r.render(page); picker = nodes(tree, (n) => n.type === Picker)[0];
  assert.equal(picker.props.initialFolder, "logos");
  picker.props.onChoose("https://example.com/logo.png"); tree = r.render(page);
  assert.equal(nodes(tree, (n) => n.type === Row)[0].props.beat.artworkUrl, "https://example.com/logo.png");
  assert.equal(nodes(tree, (n) => n.type === Row)[1].props.beat.artworkUrl, "");
  const pagers = nodes(tree, (n) => n.type === Pagination); assert.equal(pagers.length, 2);
  assert.deepEqual(pagers.map((n) => n.props.location), ["top", "bottom"]);
  assert.equal(pagers[0].props.onChange, pagers[1].props.onChange);
});

test("both inventory pagers navigate the same catalogue while retaining unsaved edits", () => {
  const catalogue = Array.from({ length: 27 }, (_, index) => ({ ...make(`beat-${index}`), title: `Beat ${String(index + 1).padStart(2, "0")}`, plays: 0, downloads: 0 }));
  const r = runtime([catalogue, false]); const Row = () => null, Pagination = () => null;
  const page = load("app/admin/beats/page.tsx", { react: r.hooks, "next/script": { default: () => null }, "../components/AdminLayout": { default: () => null }, "../components/BeatEditorsPickButton": { default: () => null }, "../components/BeatAssetPicker": { default: () => null }, "../components/BeatInventoryItem": { default: Row }, "../components/InventoryPagination": { default: Pagination }, "../components/CatalogueTagsInput": { default: () => null }, "@/lib/catalogueTags": { normaliseTags: (tags) => tags } }).default;
  let tree = r.render(page);
  nodes(tree, (n) => n.type === Row)[0].props.onChange("bpm", 93.75); tree = r.render(page);
  nodes(tree, (n) => n.type === Pagination && n.props.location === "top")[0].props.onChange(2); tree = r.render(page);
  assert.equal(nodes(tree, (n) => n.type === Row)[0].props.beat.title, "Beat 25");
  assert.ok(nodes(tree, (n) => n.type === Pagination).every((n) => n.props.currentPage === 2));
  nodes(tree, (n) => n.type === Pagination && n.props.location === "bottom")[0].props.onChange(1); tree = r.render(page);
  assert.equal(nodes(tree, (n) => n.type === Row)[0].props.beat.bpm, 93.75);
});
