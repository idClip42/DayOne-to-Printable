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
// TODO: Double-check timezone crossing and lack of timezone.
// TODO: Page numbers!
// TODO: Once we're in a good place with this, we should look into what libraries we can bring in to augment all of this. How should one be laying out a book in HTML/JS?
// TODO: Image processing is rotating (unrotating?) some images.
//  - February 2, 2025, 4:50 PM (4ef2b394fe5008ee1428f2ce2a2bdce9.jpg)
//  - January 1, 2025, 1:05 PM (Hannibal Lecter)
//  - March 22, 2025, 5:43 PM (Bike)
//  - (Check to make sure that some of these weren't just originally oriented wrong.)
// TODO: Block quotes still not excluding everything. (March 13, 2025, 8:43 PM) (February 9, 2025, 7:43 PM) (March 2, 2025, 8:15 AM)
// TODO: Words being broken up by hyphens needlessly. (What will fixing this do to the page count?) (January 4, 2025, 9:54 PM)
// TODO: Single line-breaks not working right always. (January 21, 2025, 8:20 PM - is it the italics?)
// TODO: Surrounding text with "=="s ("==6 Optional Files==") indicates it's highlighted. (February 1, 2025, 8:36 PM) (February 9, 2025, 7:53 PM)

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
