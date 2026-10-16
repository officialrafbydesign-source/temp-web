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
function runtime() {
  const state = []; let cursor = 0;
  return {
    hooks: { ...React, useState(initial) { const index = cursor++; if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial;
      return [state[index], (next) => { state[index] = typeof next === "function" ? next(state[index]) : next; }]; },
      useRef(value) { const index = cursor++; if (!(index in state)) state[index] = { current: value }; return state[index]; }, useEffect() {} },
    render(Component, props) { cursor = 0; return Component(props); },
  };
}
function nodes(tree, predicate) {
  if (!tree || typeof tree !== "object") return [];
  return [...(predicate(tree) ? [tree] : []), ...React.Children.toArray(tree.props?.children).flatMap((child) => nodes(child, predicate))];
}
const pagination = load("lib/adminPagination.ts");
const ordering = load("lib/beatStoreOrder.ts");

test("small inventories show every page number and large ones retain first/last/current neighbours", () => {
  assert.deepEqual(plain(pagination.pageNumbers(3, 5)), [1, 2, 3, 4, 5]);
  assert.deepEqual(plain(pagination.pageNumbers(50, 100)), [1, "ellipsis", 48, 49, 50, 51, 52, "ellipsis", 100]);
  assert.deepEqual(plain(pagination.pageNumbers(1, 100)), [1, 2, 3, "ellipsis", 100]);
});
test("page jumps accept only whole page numbers within the inventory", () => {
  assert.equal(pagination.parsePageInput(" 5 ", 5), 5);
  for (const value of ["", "0", "6", "2.5", "2e0", "-1", "NaN", "Infinity"]) assert.equal(pagination.parsePageInput(value, 5), null);
});
test("pagination renders numbered buttons, the active page and a direct page input", () => {
  const Component = load("app/admin/components/InventoryPagination.tsx", { "@/lib/adminPagination": pagination }).default;
  const html = renderToStaticMarkup(React.createElement(Component, { currentPage: 3, totalPages: 5, totalItems: 103, pageSize: 24, onChange() {} }));
  assert.match(html, /Page 3 of 5/);
  assert.match(html, /Showing 49–72 of 103 beats/);
  assert.match(html, /aria-label="Page 3" aria-current="page"/);
  assert.match(html, /Go to page/);
  assert.match(html, /aria-label="Page 5"/);
});
test("numbered buttons and the Go form navigate without changing inventory data", () => {
  const r = runtime(); const changed = [];
  const Component = load("app/admin/components/InventoryPagination.tsx", { react: r.hooks, "@/lib/adminPagination": pagination }).default;
  const props = { currentPage: 1, totalPages: 5, totalItems: 103, pageSize: 24, onChange: (page) => changed.push(page) };
  let tree = r.render(Component, props);
  nodes(tree, (node) => node.props?.["aria-label"] === "Page 4")[0].props.onClick();
  nodes(tree, (node) => node.type === "input")[0].props.onChange({ target: { value: "5" } });
  tree = r.render(Component, props);
  nodes(tree, (node) => node.type === "form")[0].props.onSubmit({ preventDefault() {} });
  assert.deepEqual(changed, [4, 5]);
  nodes(tree, (node) => node.type === "input")[0].props.onChange({ target: { value: "99" } });
  tree = r.render(Component, props);
  nodes(tree, (node) => node.type === "form")[0].props.onSubmit({ preventDefault() {} });
  assert.deepEqual(changed, [4, 5]);
});

const makeBeat = (id, createdAt, extra = {}) => ({ id, title: `Beat ${id}`, createdAt, storeOrder: 1000000, deletedAt: null, isPublished: true, isAvailable: true,
  bpm: 92.5, tags: ["Soul"], freeDownload: false, audioUrl: "https://example.com/tagged.mp3", fileUrl: `private/${id}.zip`,
  licenses: [{ id: "lease-1", name: "Standard", price: 2999, fileUrl: "private/audio.mp3" }], ...extra });
const initial = [makeBeat("newer", "2026-10-16"), makeBeat("older", "2026-01-01"), makeBeat("hidden", "2026-06-01", { isPublished: false })];
test("existing unpositioned beats remain newest-first and positioned beats come before new beats", () => {
  assert.deepEqual(initial.slice().sort(ordering.compareBeatStoreOrder).map((item) => item.id), ["newer", "hidden", "older"]);
  const positioned = [initial[0], { ...initial[1], storeOrder: 1 }, { ...initial[2], storeOrder: 2 }];
  assert.deepEqual(positioned.sort(ordering.compareBeatStoreOrder).map((item) => item.id), ["older", "hidden", "newer"]);
});
test("moving beats and refreshing the catalogue retains each product once", () => {
  assert.deepEqual(plain(ordering.moveBeat(["a", "b", "c"], "c", 1)), ["c", "a", "b"]);
  assert.deepEqual(plain(ordering.moveBeat(["a", "b"], "a", 2)), ["b", "a"]);
  assert.deepEqual(plain(ordering.moveBeat(["a", "b"], "missing", 1)), ["a", "b"]);
  assert.deepEqual(plain(ordering.reconcileBeatOrder(["older", "deleted", "newer"], initial)), ["older", "newer", "hidden"]);
});
function fixture({ authorized = true, failAt = 0, missingAt = 0 } = {}) {
  let rows = plain(initial); const writes = []; const queries = [];
  const prisma = { $transaction: async (callback) => {
    const before = plain(rows);
    try { return await callback({ beat: {
      findMany: async (args) => { queries.push(args); return rows.filter((row) => row.deletedAt === null).map(({ id }) => ({ id })); },
      updateMany: async (args) => {
        writes.push(plain(args));
        if (writes.length === failAt) throw new Error("Database failure");
        if (writes.length === missingAt) return { count: 0 };
        const row = rows.find((row) => row.id === args.where.id && row.deletedAt === null);
        if (!row) return { count: 0 };
        Object.assign(row, args.data); return { count: 1 };
      },
    } }); } catch (error) { rows = before; throw error; }
  } };
  const route = load("app/api/admin/beats/order/route.ts", {
    "@/lib/prisma": { prisma }, "@/lib/adminApi": { authorizeAdminApi: async () => authorized ? { authorized: true } : { authorized: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } },
  });
  return { route, rows: () => rows, writes, queries };
}
const request = (body) => new Request("https://example.com/api/admin/beats/order", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) });
test("saving store order changes only positions, retaining hidden beats and every paid asset", async () => {
  const f = fixture();
  const response = await f.route.PATCH(request({ ids: ["older", "hidden", "newer"], price: 0, isPublished: true }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal((await response.json()).success, true);
  for (const write of f.writes) assert.deepEqual(Object.keys(write.data), ["storeOrder"]);
  for (const original of initial) {
    const actual = f.rows().find((row) => row.id === original.id);
    assert.deepEqual({ ...actual, storeOrder: original.storeOrder }, plain(original));
  }
  assert.deepEqual(f.rows().sort(ordering.compareBeatStoreOrder).map((row) => row.id), ["older", "hidden", "newer"]);
});
test("unauthorized users cannot read or change store order", async () => {
  const f = fixture({ authorized: false });
  assert.equal((await f.route.PATCH(request({ ids: ["older", "hidden", "newer"] }))).status, 401);
  assert.equal(f.queries.length, 0); assert.equal(f.writes.length, 0);
});
test("malformed order lists and duplicate IDs are rejected without writes", async () => {
  for (const body of [null, {}, { ids: "a" }, { ids: [1] }, { ids: [""] }, { ids: ["older", "older"] }, "{invalid"]) {
    const f = fixture(); assert.equal((await f.route.PATCH(request(body))).status, 400); assert.equal(f.writes.length, 0);
  }
});
test("omitted, stale and unknown products cannot produce a partial store order", async () => {
  for (const ids of [["older", "newer"], ["older", "newer", "unknown"], []]) {
    const f = fixture(); assert.equal((await f.route.PATCH(request({ ids }))).status, 409); assert.equal(f.writes.length, 0);
  }
});
test("database failures and concurrent deletion roll back all position changes", async () => {
  for (const options of [{ failAt: 2 }, { missingAt: 2 }]) {
    const f = fixture(options);
    const response = await f.route.PATCH(request({ ids: ["older", "hidden", "newer"] }));
    assert.equal(response.status, options.failAt ? 500 : 409);
    assert.deepEqual(f.rows(), plain(initial));
  }
});
for (const name of ["app/api/beats/route.ts"]) {
  test(`${name} returns visible beats in saved store order`, async () => {
    const data = [{ ...initial[1], storeOrder: 1 }, { ...initial[2], storeOrder: 2 }, { ...initial[0], storeOrder: 3 }];
    const route = load(name, {
      "@/lib/beatStoreOrder": ordering,
      "@/lib/beatBpm": load("lib/beatBpm.ts"),
      "@/lib/prisma": { prisma: { beat: { findMany: async (args) => {
        assert.deepEqual(plain(args.orderBy), [{ storeOrder: "asc" }, { createdAt: "desc" }, { id: "asc" }]);
        assert.equal(args.where.isPublished, true); assert.equal(args.where.deletedAt, null); assert.equal(args.where.isAvailable, true);
        return data.filter((row) => row.isPublished && row.isAvailable && row.deletedAt === null).sort(ordering.compareBeatStoreOrder);
      } } } },
      "@/lib/catalogueVisibility": { PUBLIC_CATALOGUE_WHERE: { isPublished: true, deletedAt: null }, isPublicCatalogueItem: () => true },
      "@/lib/adminApi": {}, "@/lib/catalogueAdmin": {},
    });
    const response = await route.GET(new Request("https://example.com/api/beats"));
    assert.equal(response.status, 200); assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual((await response.json()).map((row) => row.id), ["older", "newer"]);
  });
}
test("beat ordering controls move a beat, submit only ordered IDs and retain the draft on failure", async () => {
  for (const ok of [true, false]) {
    const r = runtime(); const sent = []; const saved = [];
    const Component = load("app/admin/components/BeatStoreOrder.tsx", { react: r.hooks, "@/lib/beatStoreOrder": ordering }, {
      fetch: async (url, options) => { sent.push({ url, body: JSON.parse(options.body) }); return { ok, json: async () => ok ? { success: true, items: [{ id: "older", storeOrder: 1 }, { id: "newer", storeOrder: 2 }] } : { error: "Could not save" } }; },
    }).default;
    const props = { beats: initial.filter((row) => row.id !== "hidden"), disabled: false, onSaved: (items) => saved.push(plain(items)) };
    let tree = r.render(Component, props);
    nodes(tree, (node) => node.props?.["aria-label"] === "Move Beat older up")[0].props.onClick();
    tree = r.render(Component, props);
    assert.match(renderToStaticMarkup(tree), /Order changes are not saved yet/);
    await nodes(tree, (node) => node.type === "button" && node.props.children === "Save store order")[0].props.onClick();
    assert.deepEqual(sent[0], { url: "/api/admin/beats/order", body: { ids: ["older", "newer"] } });
    assert.equal(saved.length, ok ? 1 : 0);
    tree = r.render(Component, props);
    if (!ok) assert.match(renderToStaticMarkup(tree), /Could not save/);
  }
});

for (const selectedSort of ["store-order", "newest"]) {
  test(`the public Beat Store renders ${selectedSort === "store-order" ? "the admin order by default" : "the customer's newest-first choice"}`, () => {
    let slot = 0;
    const beats = [makeBeat("newest", "2026-10-16", { title: "Newest Beat", storeOrder: 2 }), makeBeat("promoted", "2026-01-01", { title: "Promoted Beat", storeOrder: 1 })];
    const overrides = { 0: beats, 1: false, ...(selectedSort === "newest" ? { 6: "newest" } : {}) };
    const page = load("app/beats/store/page.tsx", {
      react: { ...React, useState(initial) { const index = slot++; return [index in overrides ? overrides[index] : initial, () => {}]; }, useEffect() {}, useMemo: (fn) => fn() },
      "@/lib/beatStoreOrder": ordering,
      "@/lib/audioStore": { useAudioStore: (select) => select({ queue: [], currentIndex: 0, playing: false, playTrack() {}, setPlaying() {} }) },
      "next/link": { default: ({ children, href, ...props }) => React.createElement("a", { href, ...props }, children) },
      "lucide-react": new Proxy({}, { get: () => () => React.createElement("span") }),
    });
    const html = renderToStaticMarkup(React.createElement(page.default));
    assert.ok(html.includes("Promoted Beat") && html.includes("Newest Beat"));
    assert.equal(html.indexOf("Promoted Beat") < html.indexOf("Newest Beat"), selectedSort === "store-order");
  });
}
for (const name of ["app/api/music/route.ts", "app/api/music/release/route.ts"]) {
  test(`${name} keeps its original newest-first music behavior`, async () => {
    const route = load(name, {
      "@/lib/prisma": { prisma: { musicProduct: { findMany: async (args) => {
        assert.deepEqual(plain(args.orderBy), { createdAt: "desc" });
        return [{ id: "music-1", price: 9.99, release: { id: "release-1", title: "Music", artist: { name: "RAF" }, songs: [] } }];
      } } } },
      "@/lib/catalogueVisibility": { PUBLIC_CATALOGUE_WHERE: { isPublished: true, deletedAt: null }, isPublicCatalogueItem: () => true },
      "@/lib/adminApi": {}, "@/lib/catalogueAdmin": {},
    });
    assert.equal((await route.GET()).status, 200);
  });
}
test("the retired music ordering URL cannot change music releases", async () => {
  const route = load("app/api/admin/music-products/order/route.ts", { "@/lib/adminApi": { authorizeAdminApi: async () => ({ authorized: true }) } });
  assert.equal((await route.PATCH()).status, 410);
});
test("reloading beat admin returns saved positions alongside exact BPM and download fields", async () => {
  const beat = { ...initial[0], storeOrder: 7, downloadLogs: [], backgroundImage: "https://example.com/bg.png" };
  const route = load("app/api/admin/beats/route.ts", {
    "@/lib/beatBpm": load("lib/beatBpm.ts"),
    "@/lib/prisma": { prisma: { beat: { findMany: async () => [beat] } } },
    "@/lib/adminApi": { authorizeAdminApi: async () => ({ authorized: true }) },
  });
  const response = await route.GET();
  assert.equal(response.status, 200);
  const data = await response.json();
  const item = Array.isArray(data) ? data[0] : data.beats[0];
  assert.equal(item.storeOrder, 7);
  assert.equal(item.bpm, 92.5);
  assert.equal(item.standardFileUrl, "private/audio.mp3");
});
