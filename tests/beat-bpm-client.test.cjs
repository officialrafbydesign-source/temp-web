const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { NextResponse } = require("next/server");
const root = path.resolve(__dirname, "..");
function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: (id) => id in mocks ? mocks[id] : require(id), URL, console: { error() {} } });
  return module.exports;
}
const metadata = (type) => ({ Prisma: { dmmf: { datamodel: { models: [{ name: "Beat", fields: [{ name: "bpm", type }] }] } } } });
const guard = (type) => load("lib/beatBpmClient.ts", { "@prisma/client": metadata(type) });
test("a generated Float client passes the save guard", () => { assert.doesNotThrow(() => guard("Float").assertBeatBpmClient()); });
for (const type of ["Int", "String", "Decimal", undefined]) test(`a ${type || "missing"} BPM model cannot save beats`, () => { assert.throws(() => guard(type).assertBeatBpmClient(), /database client is outdated/); });
const parser = load("lib/beatBpm.ts");
test("corrupted subnormal values cannot be saved again", () => {
  for (const value of [4.59481050632359e-322, "4.64421707090772e-322", 1e-300, 0.5]) assert.throws(() => parser.parseBeatBpm(value), /at least 1/);
  for (const value of [1, 93, 93.5, 142, "128.125"]) assert.equal(parser.parseBeatBpm(value), Number(value));
  assert.equal(parser.parseBeatBpm(""), null);
});
for (const [file, method] of [["app/api/admin/beats/route.ts", "POST"], ["app/api/admin/beats/bulk-update/route.ts", "PUT"], ["app/api/admin/beats/bulk-upload/route.ts", "POST"], ["app/api/beats/route.ts", "POST"]]) {
  test(`${file} blocks an old Int client before any database mutation`, async () => {
    let touched = false;
    const prisma = new Proxy({}, { get() { touched = true; throw new Error("Must not touch database"); } });
    const route = load(file, {
      "@/lib/prisma": { prisma }, "@/lib/beatBpm": parser, "@/lib/beatBpmClient": guard("Int"),
      "@/lib/adminApi": { authorizeAdminApi: async () => ({ authorized: true }) },
      "@/lib/beatStoreOrder": {}, "@/lib/catalogueVisibility": {},
    });
    const response = await route[method](new Request("https://example.com/api/beats", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "Tempo", bpm: 93, beats: [{ id: "one", bpm: 93 }] }) }));
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /regenerate Prisma and redeploy/);
    assert.equal(touched, false);
  });
}
