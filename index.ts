import fs from "fs";
import path from "path";
import { DayOneEntry } from "./src/types/DayOneEntry";
import config from "./config.json";
import { resizeImages } from "./src/preprocess/resizeImages";
import { initializeStaticTags } from "./src/tags";
import { generateCoverHtml } from "./src/cover";
import { buildFullHtml } from "./src/book";

const stylesheet = fs.readFileSync(config.files.stylesheets.interior, "utf8");

const dataPath = path.join(
    config.files.input.directory,
    config.files.input.dataFile
);
const outputPath = path.join(
    config.files.output.directory,
    config.files.output.interiorHtmlFile
);
if (!fs.existsSync(config.files.output.directory))
    fs.mkdirSync(config.files.output.directory);

if (config.content.images.runResize) await resizeImages();

const rawJson = fs.readFileSync(dataPath, "utf-8");
const entries: DayOneEntry[] = JSON.parse(rawJson).entries;
console.log(entries.length, "entries");

initializeStaticTags(entries);
const fullHTML = buildFullHtml(entries, stylesheet);

fs.writeFileSync(outputPath, fullHTML);
console.log(`✅ Exported HTML journal to ${outputPath}`);

const coverOutputPath = path.join(
    config.files.output.directory,
    config.files.output.coverHtmlFile
);
const coverHtml = generateCoverHtml({
    start: new Date(entries[0].creationDate),
    end: new Date(entries[entries.length - 1].creationDate),
});
fs.writeFileSync(coverOutputPath, coverHtml);
console.log(`✅ Exported HTML cover to ${coverOutputPath}`);
