import fs from "fs";
import path from "path";
import { processText } from "./src/entry/internal/content/internal/text/process";

const TEST_DIR = "tests";
const INPUT_EXT = ".input.json";
const OUTPUT_EXT = ".output.md";

const testFilenames = fs.readdirSync(TEST_DIR);
const inputFilenames = testFilenames.filter(fn => fn.endsWith(INPUT_EXT));

for (const inputFilename of inputFilenames) {
    const fullPath = path.join(TEST_DIR, inputFilename);
    const inputText = fs.readFileSync(fullPath, "utf8");
    const inputMarkdown = JSON.parse(inputText);
    const outputText = processText(inputMarkdown, null);
    fs.writeFileSync(fullPath.replace(INPUT_EXT, OUTPUT_EXT), outputText);
}
