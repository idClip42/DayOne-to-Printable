import fs from "fs";
import path from "path";
import config from "./config.json";
import { processText } from "./src/entry/internal/content/internal/text/process";
import type { DayOneEntry } from "./src/types/DayOneEntry";
import { logProgress } from "./src/utilities/progress";

const OBFUS_FILE = "testObfuscation.json";
const INPUT_EXT = ".input.json";
const OUTPUT_EXT = ".output.md";
const OUTPUT_DIR = "output-tests";

const REPLACERS: [string, string][] = (() => {
    if (fs.existsSync(OBFUS_FILE)) {
        const obfusText = fs.readFileSync(OBFUS_FILE, "utf8");
        const obfusObj = JSON.parse(obfusText);
        if (!Array.isArray(obfusObj))
            throw new Error(`'${OBFUS_FILE}' is not an array.`);
        return obfusObj.map<[string, string]>(o => [o[0], o[1]]);
    } else {
        console.warn(
            "WARN: No test obfuscation file. Entries will be saved as-is."
        );
        return [];
    }
})();

const startTimeMs = Date.now();

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

const fileSavePromises = [];
for (const e in entries) {
    const index = Number(e);
    if (index % 100 === 0) logProgress(index, entries);
    const entry = entries[index];
    const d = new Date(entry.creationDate);
    const name =
        d.getFullYear().toString() +
        "-" +
        (d.getMonth() + 1).toString().padStart(2, "0") +
        "-" +
        d.getDate().toString().padStart(2, "0") +
        "_" +
        d.getHours().toString().padStart(2, "0") +
        d.getMinutes().toString().padStart(2, "0");

    let text = entry.text;
    for (const repl of REPLACERS) {
        text = text.replace(new RegExp(repl[0], "gi"), repl[1]);
    }
    const escapedText = JSON.stringify(text);
    const processedText = processText(text, null);

    const promA = fs.promises.writeFile(
        path.join(OUTPUT_DIR, name + INPUT_EXT),
        escapedText
    );
    const promB = fs.promises.writeFile(
        path.join(OUTPUT_DIR, name + OUTPUT_EXT),
        processedText
    );
    fileSavePromises.push(promA, promB);
}

console.log("Waiting for saving to finish...");
await Promise.all(fileSavePromises);
const endTimeMs = Date.now();
const elapsedSeconds = (endTimeMs - startTimeMs) / 1000;
console.log(`All entries processed in ${elapsedSeconds.toFixed(2)}s.`);
