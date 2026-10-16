const fs = require("node:fs");
const { Prisma } = require("@prisma/client");
const schema = fs.readFileSync("prisma/schema.prisma", "utf8");
const beatModel = schema.match(/model\s+Beat\s*\{([\s\S]*?)\n\}/)?.[1];
const field = Prisma.dmmf.datamodel.models.find((model) => model.name === "Beat")?.fields.find((item) => item.name === "bpm");
if (!beatModel || !/^\s*bpm\s+Float\?/m.test(beatModel) || field?.type !== "Float") {
  console.error("BPM client check FAILED. Beat.bpm must be Float? in the schema and Float in the generated client. Run npm run build after replacing the schema.");
  process.exitCode = 1;
} else {
  console.log("BPM client check PASSED: schema Float?, generated client Float.");
}
