import fs from "fs";
import path from "path";
import { DayOneEntry } from "./src/types/DayOneEntry";
import config from "./config.json";
import { generateCoverHtml } from "./src/cover";

const dataPath = path.join(
    config.files.input.directory,
    config.files.input.dataFile
);
const outputPath = path.join(
    config.files.output.directory,
    config.files.output.coverHtmlFile
);
if (!fs.existsSync(config.files.output.directory))
    fs.mkdirSync(config.files.output.directory);

const rawJson = fs.readFileSync(dataPath, "utf-8");
const entries: DayOneEntry[] = JSON.parse(rawJson).entries;
console.log(entries.length, "entries");

generateCoverHtml({
    start: new Date(entries[0].creationDate),
    end: new Date(entries[entries.length - 1].creationDate),
})
    .then(coverHtml => fs.promises.writeFile(outputPath, coverHtml))
    .then(() => console.log(`✅ Exported HTML cover to ${outputPath}`));
