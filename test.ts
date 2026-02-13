import fs from "fs";
import path from "path";
import { createTwoFilesPatch } from "diff";
import { processText } from "./src/entry/internal/content/internal/text/process";

const TEST_DIR = "tests";
const INPUT_EXT = ".input.md";
const OUTPUT_EXT = ".output.md";
const OUTPUT_DIR = "output-tests";

enum TestMode {
    MakeOutput,
    CompareToOutput,
}

const MODE = ((): TestMode => {
    return TestMode.CompareToOutput;
})();

const testFilenames = fs.readdirSync(TEST_DIR);
const inputFilenames = testFilenames.filter(fn => fn.endsWith(INPUT_EXT));
const outputFilenames = testFilenames.filter(fn => fn.endsWith(OUTPUT_EXT));

if (MODE === TestMode.MakeOutput) {
    for (const inputFilename of inputFilenames) {
        const fullPath = path.join(TEST_DIR, inputFilename);
        const inputText = fs.readFileSync(fullPath, "utf8");
        const outputText = processText(inputText, null);
        fs.writeFileSync(fullPath.replace(INPUT_EXT, OUTPUT_EXT), outputText);
    }
} else if (MODE === TestMode.CompareToOutput) {
    if (inputFilenames.length !== outputFilenames.length)
        throw new Error("Different input and output file counts.");

    // Clear out output folder
    const preexistingDiffs = fs.readdirSync(OUTPUT_DIR);
    for (const diffFilename of preexistingDiffs)
        fs.rmSync(path.join(OUTPUT_DIR, diffFilename));

    const testNames = inputFilenames.map(fn => fn.replace(INPUT_EXT, ""));
    for (const i in testNames) {
        const index = Number(i);

        const testName = testNames[index];
        const inputFilename = inputFilenames[index];
        const outputFilename = outputFilenames[index];

        if (!inputFilename.includes(testName))
            throw new Error(`'${inputFilename}' doesn't have '${testName}'.`);
        if (!outputFilename.includes(testName))
            throw new Error(`'${outputFilename}' doesn't have '${testName}'.`);

        const inputFullPath = path.join(TEST_DIR, inputFilename);
        const inputText = fs.readFileSync(inputFullPath, "utf8");
        const expectedOutputFullPath = path.join(TEST_DIR, outputFilename);
        const expectedOutputText = fs.readFileSync(
            expectedOutputFullPath,
            "utf8"
        );

        const currentOutput = processText(inputText, null);

        if (currentOutput !== expectedOutputText) {
            console.log(`!!! Test '${testName}' failed.`);

            const targetOutputFilePath = path.join(OUTPUT_DIR, outputFilename);

            const patch = createTwoFilesPatch(
                expectedOutputFullPath, // old filename (shown in diff header)
                targetOutputFilePath, // new filename
                expectedOutputText,
                currentOutput,
                "(Expected)", // optional old header
                "(Actual)", // optional new header
                { context: 3 } // lines of context
            );
            fs.writeFileSync(
                path.join(OUTPUT_DIR, `${testName}.md.diff`),
                patch
            );
            fs.writeFileSync(targetOutputFilePath, currentOutput);
        }
    }
}
