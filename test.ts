import fs from "fs";
import path from "path";
import { processText } from "./src/entry/internal/content/internal/text/process";

const TEST_DIR = "tests";
const INPUT_EXT = ".input.md";
const OUTPUT_EXT = ".output.md";

const testFilenames = fs.readdirSync(TEST_DIR);
const inputFilenames = testFilenames.filter(fn => fn.endsWith(INPUT_EXT));

for (const inputFilename of inputFilenames) {
    const fullpath = path.join(TEST_DIR, inputFilename);
    const inputText = fs.readFileSync(fullpath, "utf8");
    const outputText = processText(inputText, null);
    fs.writeFileSync(fullpath.replace(INPUT_EXT, OUTPUT_EXT), outputText);
}
