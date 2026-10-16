import { Prisma } from "@prisma/client";

export class BeatBpmClientMismatch extends Error {
  constructor() {
    super("Beat saving is paused because the server's BPM database client is outdated. Ensure Beat.bpm is Float? in prisma/schema.prisma, regenerate Prisma and redeploy.");
  }
}

export function assertBeatBpmClient() {
  const field = Prisma.dmmf.datamodel.models.find((model) => model.name === "Beat")?.fields.find((item) => item.name === "bpm");
  if (field?.type !== "Float") throw new BeatBpmClientMismatch();
}
