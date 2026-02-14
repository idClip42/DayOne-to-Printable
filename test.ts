import fs from "fs";
import path from "path";
import { createTwoFilesPatch } from "diff";
import { processText } from "./src/entry/internal/content/internal/text/process";

const TEST_DIR = "tests";
const INPUT_EXT = ".input.json";
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
        const inputMarkdown = JSON.parse(inputText);
        processText(inputMarkdown, null).then(outputText =>
            fs.promises.writeFile(
                fullPath.replace(INPUT_EXT, OUTPUT_EXT),
                outputText
            )
        );
    }
} else if (MODE === TestMode.CompareToOutput) {
    // Clear out output folder
    const preexistingDiffs = fs.readdirSync(OUTPUT_DIR);
    for (const diffFilename of preexistingDiffs)
        fs.rmSync(path.join(OUTPUT_DIR, diffFilename));

    const testNames = inputFilenames.map(fn => fn.replace(INPUT_EXT, ""));
    for (const testName of testNames) {
        const inputFilename = inputFilenames.find(fn =>
            fn.startsWith(testName)
        );
        if (!inputFilename) throw new Error(`No '${testName}' input found.`);
        const outputFilename = outputFilenames.find(fn =>
            fn.startsWith(testName)
        );
        if (!outputFilename) {
            console.warn(`WARN: No output found for '${inputFilename}'.`);
            continue;
        }

        if (!inputFilename.includes(testName))
            throw new Error(`'${inputFilename}' doesn't have '${testName}'.`);
        if (!outputFilename.includes(testName))
            throw new Error(`'${outputFilename}' doesn't have '${testName}'.`);

        const inputFullPath = path.join(TEST_DIR, inputFilename);
        const inputText = fs.readFileSync(inputFullPath, "utf8");
        const inputMarkdown = JSON.parse(inputText);
        const expectedOutputFullPath = path.join(TEST_DIR, outputFilename);
        const expectedOutputText = fs.readFileSync(
            expectedOutputFullPath,
            "utf8"
        );

        processText(inputMarkdown, null).then(currentOutput => {
            if (currentOutput !== expectedOutputText) {
                console.log(`!!! Test '${testName}' failed.`);

                const targetOutputFilePath = path.join(
                    OUTPUT_DIR,
                    outputFilename
                );

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
        });
    }
}
