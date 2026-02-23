import fs from "fs";
import path from "path";
import chalk from "chalk";
import { createContentHtml } from "./src/entry/internal/content";

const TEST_DIR = "tests";
const INPUT_EXT = ".input.json";
const OUTPUT_DIR = "output-tests";

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

// Clear out output folder.
// We kick this off now, and will wait
// for it to finish later before saving
// new output files to this folder.
const clearOutputFolderPromise = fs.promises
    .readdir(OUTPUT_DIR)
    .then(preexistingDiffs =>
        Promise.all(
            preexistingDiffs.map(fn =>
                fs.promises.rm(path.join(OUTPUT_DIR, fn))
            )
        )
    );

fs.promises
    .readdir(TEST_DIR)
    .then(testFilenames => testFilenames.filter(fn => fn.endsWith(INPUT_EXT)))
    .then(filenames =>
        filenames.map(inputFilename => {
            // We associate each input test with its
            // matching output test.
            const testName = inputFilename.replace(INPUT_EXT, "");
            const inputFullPath = path.join(TEST_DIR, inputFilename);

            return fs.promises
                .readFile(inputFullPath, "utf8")
                .then(inputText =>
                    createContentHtml({
                        creationDate: new Date().toISOString(),
                        text: JSON.parse(inputText),
                        richText: "",
                        isAllDay: false,
                    })
                )
                .then(htmlOutput => {
                    const htmlFilePath = path.join(
                        OUTPUT_DIR,
                        `${testName}.html`
                    );

                    // We wait for the old files to be cleared out
                    // before saving new ones.
                    return clearOutputFolderPromise.then(() =>
                        fs.promises.writeFile(htmlFilePath, htmlOutput)
                    );
                });
        })
    );
