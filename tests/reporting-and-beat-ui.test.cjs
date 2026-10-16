const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const root = path.resolve(__dirname, "..");
function load(name, mocks) {
  const source = fs.readFileSync(path.join(root, name), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: (id) => id in mocks ? mocks[id] : require(id), console });
  return module.exports;
}
function hooks(overrides = {}) {
  let slot = 0;
  return { ...React, useState(initial) { const index = slot++; return [index in overrides ? overrides[index] : typeof initial === "function" ? initial() : initial, () => {}]; }, useEffect() {}, useMemo: (fn) => fn(), useCallback: (fn) => fn, useRef: (value) => ({ current: value }) };
}
const wrapper = ({ children }) => React.createElement("div", {}, children);
const link = ({ children, href, ...rest }) => React.createElement("a", { href, ...rest }, children);
const reporting = load("lib/adminReporting.ts", {});
const storeOrder = load("lib/beatStoreOrder.ts", {});

function dashboard(period) {
  const orders = [
    { id: "historic", createdAt: "2026-10-10", amount: 5000, status: "paid", productDetails: { title: "Historic order" } },
    { id: "today", createdAt: "2026-10-16", amount: 2999, status: "paid", productDetails: { title: "Current order" } },
    { id: "test", createdAt: "2026-10-16", amount: 9900, status: "paid", excludedFromReports: true, productDetails: { title: "Excluded test" } },
  ];
  const page = load("app/admin/page.tsx", {
    react: hooks({ 0: period, 1: orders, 7: false }),
    "next/link": { default: link },
    "./components/AdminLayout": { default: wrapper },
    "./components/ReportingPeriodSelect": { default: () => null },
    "@/lib/adminReporting": reporting,
  });
  return renderToStaticMarkup(React.createElement(page.default));
}
test("the dashboard renders only new sales by default and keeps genuine outstanding work", () => {
  const html = dashboard("current");
  assert.match(html, /£29\.99/);
  assert.doesNotMatch(html, /Historic order|Excluded test|£99\.00/);
  assert.match(html, /Orders Awaiting Fulfilment<\/p><p[^>]*>2<\/p>/);
});
test("all-time restores historical revenue without restoring excluded test activity", () => {
  const html = dashboard("all");
  assert.match(html, /£79\.99/);
  assert.match(html, /Historic order/);
  assert.doesNotMatch(html, /Excluded test/);
});

const icon = () => React.createElement("span");
function store(search = "", tag = "All") {
  const beats = [
    { id: "piano", title: "Piano Beat", genre: "ObsoleteGenre", bpm: 100, key: "C Minor", tags: ["Dark Piano"], price: 29.99 },
    { id: "soul", title: "Soul Beat", genre: "ObsoleteGenre", bpm: 90, key: "C Minor", tags: ["Soul"], price: 19.99 },
  ];
  const page = load("app/beats/store/page.tsx", {
    react: hooks({ 0: beats, 1: false, 2: search, 3: tag }),
    "next/link": { default: link },
    "lucide-react": new Proxy({}, { get: () => icon }),
    "@/lib/beatStoreOrder": storeOrder,
    "@/lib/audioStore": { useAudioStore: (select) => select({ currentTrack: null, playing: false, playTrack() {}, setPlaying() {}, queue: [], currentIndex: 0 }) },
  });
  return renderToStaticMarkup(React.createElement(page.default));
}
test("the beat shop renders tag cards and filters without Genre on either layout", () => {
  const html = store();
  assert.match(html, /Filter by tag/);
  assert.match(html, /Dark Piano/);
  assert.match(html, /Soul Beat/);
  assert.doesNotMatch(html, /ObsoleteGenre|Filter by genre|>Genre</);
});
test("search and tag selection find beats by their saved tags", () => {
  const searched = store("dark piano");
  assert.match(searched, /Piano Beat/);
  assert.doesNotMatch(searched, /Soul Beat/);
  const tagged = store("", "Soul");
  assert.match(tagged, /Soul Beat/);
  assert.doesNotMatch(tagged, /Piano Beat/);
});
test("old Genre values no longer produce search results", () => {
  const html = store("ObsoleteGenre");
  assert.doesNotMatch(html, /Piano Beat|Soul Beat/);
});

test("the beat admin keeps its tag editor, key and delivery fields without asking for Genre", () => {
  const page = load("app/admin/beats/page.tsx", {
    react: hooks({ 1: false }),
    "next/script": { default: () => null },
    "../components/AdminLayout": { default: wrapper },
    "../components/CatalogueActions": { default: () => null },
    "../components/BeatStoreOrder": { default: () => null },
    "../components/BeatInventoryItem": { default: () => null },
    "../components/InventoryPagination": { default: () => null },
    "../components/CatalogueTagsInput": { default: () => React.createElement("input", { "aria-label": "Beat tags" }) },
    "@/lib/catalogueTags": { normaliseTags: (tags) => tags },
  });
  const html = renderToStaticMarkup(React.createElement(page.default));
  assert.match(html, /Beat tags/);
  assert.match(html, /Musical Key/);
  assert.match(html, /Leasing License/);
  assert.match(html, /Exclusive License/);
  assert.doesNotMatch(html, /Genre/);
});
