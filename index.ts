// generate-journal.ts
import fs from "fs";
import path from "path";
import { DayOneEntry } from "./types/DayOneEntry";
import CONFIG from "./config.json";
import {
    formatDate,
    GetDateColor,
    GetDateColorTestHtml,
    isSameLocalDay,
} from "./src/dateUtilities";
import { convertEntryToHTML } from "./src/handleEntry";
import { ResizeImages } from "./src/resizeImages";
import { GetTagsListHtml, InitializeTags } from "./src/organizeTags";
import { generateCoverHtml } from "./src/generateCoverHtml";
import { GetEntriesStatsHtml } from "./src/counter";

const stylesheet = fs.readFileSync("style.css");

const dataPath = path.join(CONFIG.FILES.INPUT_DIR, CONFIG.FILES.DATA_FILE);
const outputPath = path.join(CONFIG.FILES.OUTPUT_DIR, CONFIG.FILES.OUTPUT_HTML);
if (!fs.existsSync(CONFIG.FILES.OUTPUT_DIR))
    fs.mkdirSync(CONFIG.FILES.OUTPUT_DIR);

if (CONFIG.ENTRIES.IMAGES.RUN_RESIZE) await ResizeImages();

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
    if (!isSameDay && CONFIG.OTHER_CONTENT.INCLUDE_NEW_DAY_HEADER) {
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

        <!-- <link rel="stylesheet" type="text/css" href="../${CONFIG.FILES.STYLESHEET}"> -->
        <style>
            ${stylesheet}
        </style>

        <!-- Bringing in "pagedjs" package -->
        <!-- <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script> -->
        <script src="../node_modules/pagedjs/dist/paged.polyfill.js"></script>
    </head>
    <body>
        <!-- <div>${GetDateColorTestHtml()}</div> -->

        ${GetEntriesStatsHtml(entries)}
        ${CONFIG.OTHER_CONTENT.INCLUDE_TAG_INDEX ? GetTagsListHtml() : ""}    
        <div id="entries">
            ${entriesHtml.join("\n")}
        </div>
    </body>
</html>
`.trim();

fs.writeFileSync(outputPath, fullHTML);
console.log(`✅ Exported HTML journal to ${outputPath}`);

const coverOutputPath = path.join(
    CONFIG.FILES.OUTPUT_DIR,
    CONFIG.FILES.OUTPUT_COVER_HTML
);
const coverHtml = generateCoverHtml({
    start: new Date(entries[0].creationDate),
    end: new Date(entries[entries.length - 1].creationDate),
});
fs.writeFileSync(coverOutputPath, coverHtml);
console.log(`✅ Exported HTML cover to ${coverOutputPath}`);
