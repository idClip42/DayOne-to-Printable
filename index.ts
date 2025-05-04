// generate-journal.ts
import fs from 'fs';
import path from 'path';
import { DayOneEntry } from './types/DayOneEntry';
import CONFIG from "./config.json";
import { formatDate, isSameLocalDay } from './src/dateUtilities';
import { convertEntryToHTML } from './src/handleEntry';
import { ResizeImages } from './src/resizeImages';

// TODO: If possible, we shouldn't break inside the *headers* of each entry, and/or the headers and first body paragraph.
// TODO: Page breaks for each day - we're trying, but the CSS isn't working.
// TODO: Do actual styling once the base stuff is dealt with
// TODO: Handle video, audio, pdf (and gif?) attachments (just add a note that there was one)
// TODO: Double-check timezone crossing and lack of timezone
// TODO: Day of the week in dates

const dataPath = path.join(CONFIG.INPUT_DIR, CONFIG.DATA_FILE);
const outputPath = path.join(CONFIG.OUTPUT_DIR, CONFIG.OUTPUT_HTML);
if(!fs.existsSync(CONFIG.OUTPUT_DIR))
    fs.mkdirSync(CONFIG.OUTPUT_DIR);

if(CONFIG.RUN_RESIZE)
    await ResizeImages();

const rawJson = fs.readFileSync(dataPath, 'utf-8');
const entries: DayOneEntry[] = JSON.parse(rawJson).entries;

const entriesHtml:string[] = [];
for(const e in entries){
    const entryIndex = Number(e);
    const entry = entries[entryIndex];

    if(entryIndex > 0){
        const prevEntry = entries[entryIndex - 1];
        const isSameDay = isSameLocalDay(
            { 
                "iso": prevEntry.creationDate, 
                "timeZone": prevEntry.location.timeZoneName 
            },{ 
                "iso": entry.creationDate, 
                "timeZone": entry.location.timeZoneName 
            }
        );
        if(!isSameDay){
            entriesHtml.push(`<div class="new-day"><h2>${formatDate(entry.creationDate, entry.location.timeZoneName)}</h2></div>`);
        }
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
        <link rel="stylesheet" type="text/css" href="../${CONFIG.STYLESHEET}">
    </head>
    <body>
        <div id="entries">
            ${entriesHtml.join('\n')}
        </div>
    </body>
</html>
`.trim();

fs.writeFileSync(outputPath, fullHTML);
console.log(`✅ Exported HTML journal to ${outputPath}`);
