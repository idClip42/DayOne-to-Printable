import fs from "fs";
import path from "path";
import { createTwoFilesPatch } from "diff";
import { processText } from "./src/entry/internal/content/internal/text/process";
import chalk from "chalk";

const TEST_DIR = "tests";
const INPUT_EXT = ".input.json";
const OUTPUT_EXT = ".output.md";
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
    .then(testFilenames => ({
        // We read all the test filenames
        // and split them into input and output sets.
        input: testFilenames.filter(fn => fn.endsWith(INPUT_EXT)),
        output: testFilenames.filter(fn => fn.endsWith(OUTPUT_EXT)),
    }))
    .then(filenames =>
        filenames.input.map(inputFilename => {
            // We associate each input test with its
            // matching output test.
            const testName = inputFilename.replace(INPUT_EXT, "");
            const outputFilename = filenames.output.find(fn =>
                fn.startsWith(testName)
            );
            if (!outputFilename) {
                console.warn(
                    chalk.yellow(
                        `WARN: No output file found for '${inputFilename}'.`
                    )
                );
                return Promise.resolve();
            }

            const inputFullPath = path.join(TEST_DIR, inputFilename);
            const expectedOutputFullPath = path.join(TEST_DIR, outputFilename);

            // We kick off our input/output file
            // loading processes.
            const realOutputPromise = fs.promises
                .readFile(inputFullPath, "utf8")
                .then(inputText => processText(JSON.parse(inputText), null));
            const expectedOutputPromise = fs.promises.readFile(
                expectedOutputFullPath,
                "utf8"
            );

            // Then we wait for them to finish.
            return Promise.all([expectedOutputPromise, realOutputPromise]).then(
                ([expectedOutput, realOutput]) => {
                    if (realOutput === expectedOutput) {
                        return Promise.resolve();
                    } else {
                        // If the input and output don't match,
                        // we create a diff and save both the
                        // diff and the full generated output.

                        const diffFilePath = path.join(
                            OUTPUT_DIR,
                            `${testName}.md.diff`
                        );
                        const targetOutputFilePath = path.join(
                            OUTPUT_DIR,
                            outputFilename
                        );

                        const patch = createTwoFilesPatch(
                            expectedOutputFullPath, // old filename (shown in diff header)
                            targetOutputFilePath, // new filename
                            expectedOutput,
                            realOutput,
                            "(Expected)", // optional old header
                            "(Actual)", // optional new header
                            { context: 3 } // lines of context
                        );

                        // We wait for the old files to be cleared out
                        // before saving new ones.
                        return clearOutputFolderPromise
                            .then(() =>
                                fs.promises.writeFile(diffFilePath, patch)
                            )
                            .then(() =>
                                fs.promises.writeFile(
                                    targetOutputFilePath,
                                    realOutput
                                )
                            )
                            .then(() =>
                                console.error(
                                    chalk.red(`FAIL: ${diffFilePath}`)
                                )
                            );
                    }
                }
            );
        })
    );
