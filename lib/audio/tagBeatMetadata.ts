import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

ffmpeg.setFfmpegPath(ffmpegPath as string);

export async function tagBeatMetadata({
  inputPath,
  metadata,
}: {
  inputPath: string;
  metadata: Record<string, string>;
}): Promise<string> {
  const tempDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const outputPath = path.join(
    tempDir,
    `licensed_${uuidv4()}.mp3`
  );

  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath).output(outputPath);

    Object.entries(metadata).forEach(([key, value]) => {
      command = command.outputOptions(`-metadata ${key}=${value}`);
    });

    command
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .run();
  });
}
