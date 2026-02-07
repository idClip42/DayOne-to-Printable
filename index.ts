// generate-journal.ts
import fs from "fs";
import path from "path";
import { DayOneEntry } from "./src/types/DayOneEntry";
import config from "./config.json";
import { GetDateColor, GetDateColorTestHtml } from "./src/date/color";
import { convertEntryToHTML } from "./src/entries";
import { ResizeImages } from "./src/preprocess/resizeImages";
import { GetTagsListHtml, InitializeTags } from "./src/tags";
import { generateCoverHtml } from "./src/cover/generateCoverHtml";
import { GetEntriesStatsHtml } from "./src/stats";
import { formatDate } from "./src/date/format";
import { isSameLocalDay } from "./src/date/compare";

const stylesheet = fs.readFileSync(config.files.stylesheets.interior);

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

if (config.content.images.runResize) await ResizeImages();

const rawJson = fs.readFileSync(dataPath, "utf-8");
const entries: DayOneEntry[] = JSON.parse(rawJson).entries;

console.log(entries.length, "entries");

InitializeTags(entries);

const entriesHtml: string[] = [];
for (const e in entries) {
    const entryIndex = Number(e);
    const entry = entries[entryIndex];

    if (entryIndex % 100 === 0) {
        const perc = entryIndex / entries.length;
        console.log(
            `Entries processed: ${(perc * 100).toFixed(2)}% (${new Date(entry.creationDate).toDateString()})`
        );
    }

    if (entry.isAllDay) {
        console.log(entry);
        throw new Error(
            "Hit an 'all day' entry - figure out what to do with it."
        );
    }

    const isSameDay = (() => {
        if (entryIndex === 0) return false;
        const prevEntry = entries[entryIndex - 1];
        return isSameLocalDay(
            {
                iso: prevEntry.creationDate,
                timeZone: prevEntry.location?.timeZoneName,
            },
            {
                iso: entry.creationDate,
                timeZone: entry.location?.timeZoneName,
            }
        );
    })();
    if (!isSameDay) {
        const monthColor = GetDateColor(
            entry.creationDate,
            entry.location?.timeZoneName,
            0.4
        );
        entriesHtml.push(
            `<div class="new-day" style="color: ${monthColor}"><span>${formatDate(entry.creationDate, entry.location?.timeZoneName, false)}</span></div>`
        );
    }

    const entryHtml = convertEntryToHTML(entry);
    entriesHtml.push(entryHtml);
}

const fullHTML = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Journal Export</title>

        <style>
            ${stylesheet}
        </style>

        <!-- Bringing in "pagedjs" package -->
        <script src="../node_modules/pagedjs/dist/paged.polyfill.js"></script>
    </head>
    <body>
        <!-- <div>${GetDateColorTestHtml()}</div> -->

        ${GetEntriesStatsHtml(entries)}
        ${GetTagsListHtml()}    
        <div id="entries">
            ${entriesHtml.join("\n")}
        </div>
    </body>
</html>
`.trim();

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
