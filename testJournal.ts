import fs from "fs";
import path from "path";
import config from "./config.json";
import { processText } from "./src/entry/internal/content/internal/text/process";
import type { DayOneEntry } from "./src/types/DayOneEntry";

const INPUT_EXT = ".input.json";
const OUTPUT_EXT = ".output.md";
const OUTPUT_DIR = "output-tests";

// Clear out output folder
const preexistingDiffs = fs.readdirSync(OUTPUT_DIR);
for (const diffFilename of preexistingDiffs)
    fs.rmSync(path.join(OUTPUT_DIR, diffFilename));

const dataPath = path.join(
    config.files.input.directory,
    config.files.input.dataFile
);

const rawJson = fs.readFileSync(dataPath, "utf-8");
const entries: DayOneEntry[] = JSON.parse(rawJson).entries;
console.log(entries.length, "entries");

function logProgress(entryIndex: number, entries: DayOneEntry[]) {
    const entry = entries[entryIndex];
    const perc = entryIndex / entries.length;
    console.log(
        `Entries processed: ${(perc * 100).toFixed(2)}% (${new Date(entry.creationDate).toDateString()})`
    );
}

for (const e in entries) {
    const index = Number(e);
    if (index % 100 === 0) logProgress(index, entries);
    const entry = entries[index];
    const d = new Date(entry.creationDate);
    const name =
        d.getFullYear().toString() +
        (d.getMonth() + 1).toString().padStart(2, "0") +
        d.getDate().toString().padStart(2, "0") +
        "-" +
        d.getHours().toString().padStart(2, "0") +
        d.getMinutes().toString().padStart(2, "0");

    const text = entry.text;
    const escapedText = JSON.stringify(text);
    const processedText = processText(text, null);

    fs.writeFileSync(path.join(OUTPUT_DIR, name + INPUT_EXT), escapedText);
    fs.writeFileSync(path.join(OUTPUT_DIR, name + OUTPUT_EXT), processedText);
}
