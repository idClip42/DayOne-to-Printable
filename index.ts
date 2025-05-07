// generate-journal.ts
import fs from 'fs';
import path from 'path';
import { DayOneEntry } from './types/DayOneEntry';
import CONFIG from "./config.json";
import { formatDate, isSameLocalDay } from './src/dateUtilities';
import { convertEntryToHTML } from './src/handleEntry';
import { ResizeImages } from './src/resizeImages';
import { InitializeTags } from './src/organizeTags';

// TODO: Page breaks for each day - we're trying, but the CSS isn't working.
// TODO: Do actual styling once the base stuff is dealt with.
// TODO: Handle video, audio, pdf (and gif?) attachments (just add a note that there was one).
// TODO: Double-check timezone crossing and lack of timezone.
// TODO: Check that all file attachments exist when building file.
// TODO: How do tables end up looking?
// TODO: Consolidate the date/time styling to deemphasize repeat info and save space
// TODO: Test with all types of headers - what do they all look like?
// TODO: Page numbers!
// TODO: Tags index page at start should count up all the tags, with their colors, show what was on my mind this year

const dataPath = path.join(CONFIG.INPUT_DIR, CONFIG.DATA_FILE);
const outputPath = path.join(CONFIG.OUTPUT_DIR, CONFIG.OUTPUT_HTML);
if(!fs.existsSync(CONFIG.OUTPUT_DIR))
    fs.mkdirSync(CONFIG.OUTPUT_DIR);

if(CONFIG.RUN_RESIZE)
    await ResizeImages();

const rawJson = fs.readFileSync(dataPath, 'utf-8');
const entries: DayOneEntry[] = JSON.parse(rawJson).entries;
InitializeTags(entries);

const entriesHtml:string[] = [];
for(const e in entries){
    const entryIndex = Number(e);
    const entry = entries[entryIndex];

    const isSameDay = (()=>{
        if(entryIndex === 0) return false;
        const prevEntry = entries[entryIndex - 1];
        return isSameLocalDay(
            { 
                "iso": prevEntry.creationDate, 
                "timeZone": prevEntry.location.timeZoneName 
            },{ 
                "iso": entry.creationDate, 
                "timeZone": entry.location.timeZoneName 
            }
        );
    })();
    if(!isSameDay){
        entriesHtml.push(`<div class="new-day"><h2>${formatDate(entry.creationDate, entry.location.timeZoneName)}</h2></div>`);
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
