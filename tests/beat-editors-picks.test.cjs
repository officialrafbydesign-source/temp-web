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
  vm.runInNewContext(code, { module, exports: module.exports, require: (id) => id in mocks ? mocks[id] : require(id), URL, console: { error() {} }, ...globals });
  return module.exports;
}
function apiFixture({ authorized = true, found = true, fail = false } = {}) {
  const writes = [];
  const route = load("app/api/admin/beats/[id]/editors-pick/route.ts", {
    "@/lib/adminApi": { authorizeAdminApi: async () => authorized ? { authorized: true } : { authorized: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } },
    "@/lib/prisma": { prisma: { beat: { updateMany: async (args) => { writes.push(plain(args)); if (fail) throw new Error("DB down"); return { count: found ? 1 : 0 }; } } } },
  });
  return { route, writes };
}
const context = { params: Promise.resolve({ id: "beat-1" }) };
const request = (body) => new Request("https://example.com/api/admin/beats/beat-1/editors-pick", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) });
test("starring/un-starring saves only the editorial flag on a non-deleted beat", async () => {
  for (const value of [true, false]) {
    const f = apiFixture(); const response = await f.route.PATCH(request({ isEditorsPick: value, bpm: 999, isPublished: false, price: 0 }), context);
    assert.equal(response.status, 200); assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.deepEqual(f.writes, [{ where: { id: "beat-1", deletedAt: null }, data: { isEditorsPick: value } }]);
    assert.deepEqual(await response.json(), { success: true, id: "beat-1", isEditorsPick: value });
  }
});
test("editor picks cannot be changed by a customer or malformed payload", async () => {
  const denied = apiFixture({ authorized: false }); assert.equal((await denied.route.PATCH(request({ isEditorsPick: true }), context)).status, 401); assert.equal(denied.writes.length, 0);
  const f = apiFixture();
  for (const body of [{}, { isEditorsPick: "true" }, { isEditorsPick: 1 }, null, "{"]) assert.equal((await f.route.PATCH(request(body), context)).status, 400);
  assert.equal(f.writes.length, 0);
});
test("deleted/missing beats and write failures do not report a saved star", async () => {
  assert.equal((await apiFixture({ found: false }).route.PATCH(request({ isEditorsPick: true }), context)).status, 404);
  assert.equal((await apiFixture({ fail: true }).route.PATCH(request({ isEditorsPick: true }), context)).status, 500);
});
test("admin and public list reloads return the stored editorial flag without leaking paid download paths", async () => {
  const rows = [true, false].map((isEditorsPick, index) => ({ id: `beat-${index}`, title: "Beat", isEditorsPick, storeOrder: index + 1, bpm: 93.5,
    tags: [], audioUrl: "https://example.com/tagged.mp3", fileUrl: "private/stems.zip", downloadLogs: [],
    licenses: [{ name: "Standard Lease", price: 2999, fileUrl: "private/untagged.mp3" }] }));
  const mocks = { "@/lib/beatBpmClient": {}, "@/lib/beatBpm": {}, "@/lib/prisma": { prisma: { beat: { findMany: async () => rows } } },
    "@/lib/adminApi": { authorizeAdminApi: async () => ({ authorized: true }) },
    "@/lib/catalogueVisibility": { PUBLIC_CATALOGUE_WHERE: {}, isPublicCatalogueItem: () => true },
    "@/lib/beatStoreOrder": load("lib/beatStoreOrder.ts") };
  const admin = await (await load("app/api/admin/beats/route.ts", mocks).GET()).json();
  const publicRows = await (await load("app/api/beats/route.ts", mocks).GET(new Request("https://example.com/api/beats"))).json();
  assert.deepEqual(admin.beats.map((beat) => beat.isEditorsPick), [true, false]);
  assert.deepEqual(publicRows.map((beat) => beat.isEditorsPick), [true, false]);
  assert.doesNotMatch(JSON.stringify(publicRows), /private\/|licenses/);
});
function nodes(tree, predicate) {
  if (!tree || typeof tree !== "object") return [];
  return [...(predicate(tree) ? [tree] : []), ...React.Children.toArray(tree.props?.children).flatMap((child) => nodes(child, predicate))];
}
test("the admin star changes only after the server confirms and retains the old state on failure", async () => {
  for (const success of [true, false]) {
    const state = []; let cursor = 0; const saved = [], sent = [];
    const hooks = { ...React, useState(initial) { const index = cursor++; if (!(index in state)) state[index] = initial; return [state[index], (value) => { state[index] = value; }]; } };
    const Component = load("app/admin/components/BeatEditorsPickButton.tsx", { react: hooks }, { fetch: async (url, options) => { sent.push({ url, body: JSON.parse(options.body) }); return { ok: success, json: async () => success ? { success: true, isEditorsPick: true } : { error: "Save failed" } }; } }).default;
    const render = () => { cursor = 0; return Component({ id: "beat-1", title: "ON JOB", picked: false, onSaved: (value) => saved.push(value) }); };
    let tree = render(); await nodes(tree, (n) => n.type === "button")[0].props.onClick(); tree = render();
    assert.deepEqual(sent, [{ url: "/api/admin/beats/beat-1/editors-pick", body: { isEditorsPick: true } }]);
    assert.deepEqual(saved, success ? [true] : []);
    if (!success) assert.equal(nodes(tree, (n) => n.props?.role === "alert")[0].props.children, "Save failed");
  }
});
test("only selected storefront cards display the editor's pick star", () => {
  let slot = 0;
  const beats = [{ id: "picked", title: "Picked Beat", isEditorsPick: true, bpm: 93.5, tags: [], price: 29.99 }, { id: "normal", title: "Normal Beat", isEditorsPick: false, bpm: 94, tags: [], price: 29.99 }];
  const hooks = { ...React, useState(initial) { const index = slot++; return [index === 0 ? beats : index === 1 ? false : typeof initial === "function" ? initial() : initial, () => {}]; }, useEffect() {}, useMemo: (fn) => fn(), useCallback: (fn) => fn, useRef: (value) => ({ current: value }) };
  const page = load("app/beats/store/page.tsx", { react: hooks, "next/link": { default: ({ children, href, ...rest }) => React.createElement("a", { href, ...rest }, children) }, "lucide-react": new Proxy({}, { get: () => () => null }),
    "@/lib/beatStoreOrder": load("lib/beatStoreOrder.ts"), "@/lib/audioStore": { useAudioStore: (select) => select({ queue: [], currentIndex: 0, playing: false, playTrack() {}, setPlaying() {} }) } }).default;
  const html = renderToStaticMarkup(React.createElement(page));
  assert.equal((html.match(/aria-label="Editor&#x27;s pick"/g) || []).length, 1);
  assert.match(html, /Picked Beat/); assert.match(html, /Normal Beat/);
});
