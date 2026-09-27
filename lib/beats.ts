import fs from "fs";
import path from "path";

export type Beat = {
  id: string;
  title: string;
  genre: string;
  artworkUrl: string;
  audioUrl: string;
  freeDownload: boolean;
};

const csvFilePath = path.join(process.cwd(), "data", "beats.csv");

function parseCSV(csv: string): Beat[] {
  const lines = csv.trim().split("\n");

  if (lines.length <= 1) return [];

  const headers = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const values = line.split(",");

    const beat: any = {};

    headers.forEach((header, i) => {
      let value: string | boolean = values[i];

      if (header === "freeDownload") {
        value = value === "true";
      }

      beat[header] = value;
    });

    return beat as Beat;
  });
}

export function getAllBeats(): Beat[] {
  try {
    const csv = fs.readFileSync(csvFilePath, "utf-8");
    return parseCSV(csv);
  } catch (error) {
    console.error("Error reading beats CSV:", error);
    return [];
  }
}

export function getBeatById(id: string): Beat | undefined {
  const beats = getAllBeats();
  return beats.find((beat) => beat.id === id);
}
