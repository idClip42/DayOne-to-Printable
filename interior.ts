import fs from "fs";
import path from "path";
import { DayOneEntry } from "./src/types/DayOneEntry";
import config from "./config.json";
import { resizeImages } from "./src/preprocess/resizeImages";
import { TagsLibrary } from "./src/tags";
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

const tagsLibrary = new TagsLibrary(entries);
const fullHTML = buildFullHtml(entries, tagsLibrary, stylesheet);

fs.writeFileSync(outputPath, fullHTML);
console.log(`✅ Exported HTML journal to ${outputPath}`);
