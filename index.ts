// generate-journal.ts
import fs from 'fs';
import path from 'path';
import { DayOneEntry } from './types/DayOneEntry';
import CONFIG from "./config.json";
import { formatDate, GetDateColorTestHtml, isSameLocalDay } from './src/dateUtilities';
import { convertEntryToHTML } from './src/handleEntry';
import { ResizeImages } from './src/resizeImages';
import { GetTagsListHtml, InitializeTags } from './src/organizeTags';

// TODO: Page breaks for each day - we're trying, but the CSS isn't working.
// TODO: Do actual styling once the base stuff is dealt with.
// TODO: Handle video, audio, pdf (and gif?) attachments (just add a note that there was one).
// TODO: Double-check timezone crossing and lack of timezone.
// TODO: Check that all file attachments exist when building file.
// TODO: Test with all types of MD headers - what do they all look like?
// TODO: Page numbers!
// TODO: Once we're in a good place with this, we should look into what libraries we can bring in to augment all of this. How should one be laying out a book in HTML/JS?
// TODO: Don't put <br> between triple backticks/in "pre". (March 1, 2025, 7:13 PM) (March 22, 2025, 1:20 PM)
// TODO: Looks like <pre> doesn't do line-breaks. (March 27, 2025, 11:28 PM)

const dataPath = path.join(CONFIG.FILES.INPUT_DIR, CONFIG.FILES.DATA_FILE);
const outputPath = path.join(CONFIG.FILES.OUTPUT_DIR, CONFIG.FILES.OUTPUT_HTML);
if(!fs.existsSync(CONFIG.FILES.OUTPUT_DIR))
    fs.mkdirSync(CONFIG.FILES.OUTPUT_DIR);

if(CONFIG.ENTRIES.IMAGES.RUN_RESIZE)
    await ResizeImages();

const rawJson = fs.readFileSync(dataPath, 'utf-8');
const entries: DayOneEntry[] = JSON.parse(rawJson).entries;
InitializeTags(entries);

const entriesHtml:string[] = [];
for(const e in entries){
    const entryIndex = Number(e);
    const entry = entries[entryIndex];

    if(entryIndex % 100 === 0){
        const perc = entryIndex/entries.length;
        console.log(`Entries processed: ${(perc * 100).toFixed(2)}%`);
    }

    const isSameDay = (()=>{
        if(entryIndex === 0) return false;
        const prevEntry = entries[entryIndex - 1];
        return isSameLocalDay(
            { 
                "iso": prevEntry.creationDate, 
                "timeZone": prevEntry.location?.timeZoneName 
            },{ 
                "iso": entry.creationDate, 
                "timeZone": entry.location?.timeZoneName 
            }
        );
    })();
    if(!isSameDay && CONFIG.OTHER_CONTENT.INCLUDE_NEW_DAY_HEADER){
        entriesHtml.push(`<div class="new-day"><h2>${formatDate(entry.creationDate, entry.location?.timeZoneName)}</h2></div>`);
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
        <link rel="stylesheet" type="text/css" href="../${CONFIG.FILES.STYLESHEET}">
    </head>
    <body>
        <!-- <div>${GetDateColorTestHtml()}</div> -->

        ${CONFIG.OTHER_CONTENT.INCLUDE_TAG_INDEX ? GetTagsListHtml() : ''}    
        <div id="entries">
            ${entriesHtml.join('\n')}
        </div>
    </body>
</html>
`.trim();

fs.writeFileSync(outputPath, fullHTML);
console.log(`✅ Exported HTML journal to ${outputPath}`);
