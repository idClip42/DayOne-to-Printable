// generate-journal.ts
import fs from 'fs';
import path from 'path';
import { DayOneEntry } from './DayOneEntry';
import { marked } from 'marked';
import CONFIG from "./config.json";

// TODO: We should process all images to create JPGs with a max pixel width.
// TODO: If possible, we shouldn't break inside the *headers* of each entry, and/or the headers and first body paragraph.
// TODO: Page breaks for each day - we're trying, but the CSS isn't working.
// TODO: Get more specific with location text.
// TODO: Do actual styling once the base stuff is dealt with
// TODO: Handle video, audio, pdf (and gif?) attachments (just add a note that there was one)
// TODO: Double-check timezone crossing and lack of timezone
// TODO: Break this up into smaller files
// TODO: Rename repo to "DayOne to Printable" or something.

const dataPath = path.join(CONFIG.INPUT_DIR, CONFIG.DATA_FILE);
const photosDir = path.join(CONFIG.INPUT_DIR, CONFIG.PHOTOS_DIR); // Directory where your images are stored
const outputPath = path.join(CONFIG.OUTPUT_DIR, CONFIG.OUTPUT_HTML);
if(!fs.existsSync(CONFIG.OUTPUT_DIR))
    fs.mkdirSync(CONFIG.OUTPUT_DIR);

const rawJson = fs.readFileSync(dataPath, 'utf-8');
const entries: DayOneEntry[] = JSON.parse(rawJson).entries;

function celsiusToFahrenheit(c: number) {
    return Math.round((c * 9) / 5 + 32);
}

function formatDate(iso: string, timeZone: string): string {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
        timeZone: timeZone,
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateTime(iso: string, timeZone: string): string {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
        timeZone: timeZone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

interface DateConfig {
    iso: string;
    timeZone: string;
}

function isSameLocalDay(config1: DateConfig, config2: DateConfig): boolean {
    const formatter1 = new Intl.DateTimeFormat('en-CA', {
        timeZone: config1.timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const formatter2 = new Intl.DateTimeFormat('en-CA', {
        timeZone: config2.timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const date1 = formatter1.format(new Date(config1.iso));
    const date2 = formatter2.format(new Date(config2.iso));

    return date1 === date2;
}

function findPhoto(entry: DayOneEntry, id: string) {
    return entry.photos?.find(photo => photo.identifier === id);
}

function escapeHTML(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function preprocessEntryText(text: string): string {
    // Trim leading/trailing whitespace
    const trimmed = text.trim();

    // Find first line break
    const firstNewlineIndex = trimmed.indexOf('\n');
    const firstLine = firstNewlineIndex === -1 ? trimmed : trimmed.slice(0, firstNewlineIndex);

    // If the first line doesn't start with a markdown header but is short enough, prepend "# "
    if (!firstLine.startsWith('#') && firstLine.length <= 100) {
        return `# ${trimmed}`;
    }

    return trimmed;
}

function convertEntryToHTML(entry: DayOneEntry): string {
    let html = `<article class="entry">`;
    html += `<h2 class="entry-date">${formatDateTime(entry.creationDate, entry.location.timeZoneName)}</h2>`;

    const locParts = [
        entry.location?.localityName,
        entry.location?.administrativeArea,
        entry.location?.country,
    ].filter(Boolean);
    const location = locParts.join(', ');
    const weather = entry.weather?.conditionsDescription
        ? `${entry.weather.conditionsDescription}, ${celsiusToFahrenheit(entry.weather.temperatureCelsius ?? 0)}°F`
        : '';
    const metaLine = [location, weather].filter(Boolean).join(' — ');
    if (metaLine) {
        html += `<p class="entry-meta"><em>${escapeHTML(metaLine)}</em></p>`;
    }

    const preprocessedText = preprocessEntryText(entry.text);
    const paragraphs = preprocessedText.split(/\n{2,}/);
    for (const paragraph of paragraphs) {
        // Break paragraph into segments: either image matches or plain text
        const tokens = paragraph.split(/(!\[]\(dayone-moment:\/\/.*?\))/g);
    
        for (const token of tokens) {
            const imgMatch = token.match(/!\[]\(dayone-moment:\/\/(.*?)\)/);
            if (imgMatch) {
                const photoId = imgMatch[1];
                const photo = findPhoto(entry, photoId);
                if (photo) {
                    const filename = `${photo.md5}.${photo.type}`;
                    html += `<div class="entry-photo"><img src="${path.join("..", photosDir, filename)}" alt="Photo" /></div>`;
                }
            } else if (token.trim()) {
                // Replace single newlines with <br> and parse with marked
                const withBreaks = token.replace(/\n/g, '<br>\n');
                html += marked.parse(withBreaks);
            }
        }
    }

    html += `</article>`;
    return html;
}

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

const fullHTML = `<!DOCTYPE html>
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
</html>`;

fs.writeFileSync(outputPath, fullHTML);
console.log(`✅ Exported HTML journal to ${outputPath}`);
