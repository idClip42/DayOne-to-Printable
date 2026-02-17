import fs from "fs";
import path from "path";
import config from "./config.json";
import { processText } from "./src/entry/internal/content/internal/text/process";
import type { DayOneEntry } from "./src/types/DayOneEntry";

const OBFUS_FILE = "testObfuscation.json";
const INPUT_EXT = ".input.json";
const OUTPUT_EXT = ".output.md";
const OUTPUT_DIR = "output-tests";

const journalDataPath = path.join(
    config.files.input.directory,
    config.files.input.dataFile
);

const startTimeMs = Date.now();

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

// Kick off loading in our replacers
const replacers: Promise<[string, string][]> = (() => {
    if (!fs.existsSync(OBFUS_FILE)) {
        console.warn(
            "WARN: No test obfuscation file. Entries will be saved as-is."
        );
        return Promise.resolve([]);
    }
    return fs.promises.readFile(OBFUS_FILE, "utf8").then(obfusText => {
        const obfusObj = JSON.parse(obfusText);
        if (!Array.isArray(obfusObj))
            throw new Error(`'${OBFUS_FILE}' is not an array.`);
        return obfusObj.map<[string, string]>(o => [o[0], o[1]]);
    });
})();

// Clear out output folder.
// We kick this off now, and will wait
// for it to finish later before saving
// new output files to this folder.
const clearOutputFolderPromise = fs.promises
    .readdir(OUTPUT_DIR)
    .then(preexistingFiles =>
        Promise.all(
            preexistingFiles.map(fn =>
                fs.promises.rm(path.join(OUTPUT_DIR, fn))
            )
        )
    );

fs.promises
    .readFile(journalDataPath, "utf-8")
    .then(rawJson => {
        // Parse the entries, and then kick off each one
        // as its own asynchronous thread.
        // (So to speak.)
        const entries: DayOneEntry[] = JSON.parse(rawJson).entries;
        console.log(entries.length, "entries");
        return Promise.all(
            entries.map(async entry => {
                // Construct a filename
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
                // Replace any key words in the text
                for (const repl of await replacers) {
                    text = text.replace(new RegExp(repl[0], "gi"), repl[1]);
                }

                /** Our `.input.json` version of the journal. */
                const escapedText = JSON.stringify(text);
                /** Kick off the text processor. */
                const processedTextPromise = processText(text, null);

                // Make sure the output folder is finished clearing.
                await clearOutputFolderPromise;

                // Kick off the writing of both files.
                const promA = fs.promises.writeFile(
                    path.join(OUTPUT_DIR, name + INPUT_EXT),
                    escapedText
                );
                const promB = processedTextPromise.then(processedText =>
                    fs.promises.writeFile(
                        path.join(OUTPUT_DIR, name + OUTPUT_EXT),
                        processedText
                    )
                );

                // Then wait for both to finish.
                return Promise.all([promA, promB]);
            })
        );
    })
    .then(() => {
        const endTimeMs = Date.now();
        const elapsedSeconds = (endTimeMs - startTimeMs) / 1000;
        console.log(`All entries processed in ${elapsedSeconds.toFixed(2)}s.`);
    });
