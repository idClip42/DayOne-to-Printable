import fs from "fs";
import path from "path";
import { DayOneEntry } from "./src/types/DayOneEntry";
import config from "./config.json";
import { resizeImages } from "./src/preprocess/resizeImages";
import { TagsLibrary } from "./src/tags";
import { generateCoverHtml } from "./src/cover";
import { buildFullHtml } from "./src/book";

const startTimeMs = Date.now();

// TODO: Load in stylesheet asynchronously
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

/** This must be synchronous */
const rawJson = fs.readFileSync(dataPath, "utf-8");
const entries: DayOneEntry[] = JSON.parse(rawJson).entries;
console.log(entries.length, "entries");

const tagsLibrary = new TagsLibrary(entries);
const interiorFilePromise = buildFullHtml(entries, tagsLibrary, stylesheet)
    .then(fullHTML => {
        console.log("Writing interior file...");
        return fs.promises.writeFile(outputPath, fullHTML);
    })
    .then(() => console.log(`✅ Exported HTML journal to ${outputPath}`));

const coverOutputPath = path.join(
    config.files.output.directory,
    config.files.output.coverHtmlFile
);
const coverHtml = generateCoverHtml({
    start: new Date(entries[0].creationDate),
    end: new Date(entries[entries.length - 1].creationDate),
});
const coverFilePromise = fs.promises
    .writeFile(coverOutputPath, coverHtml)
    .then(() => console.log(`✅ Exported HTML cover to ${coverOutputPath}`));

await Promise.all([interiorFilePromise, coverFilePromise]);

const endTimeMs = Date.now();
const elapsedSeconds = (endTimeMs - startTimeMs) / 1000;
console.log(`Journal rendered in ${elapsedSeconds.toFixed(2)}s.`);
