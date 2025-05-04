// generate-journal.ts
import fs from 'fs';
import path from 'path';
import { DayOneEntry } from './DayOneEntry';
import { marked } from 'marked';
import CONFIG from "./config.json";

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

function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
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

function convertEntryToHTML(entry: DayOneEntry): string {
    let html = `<article class="entry">`;
    html += `<h2 class="entry-date">${formatDateTime(entry.creationDate)}</h2>`;

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

    const paragraphs = entry.text.split(/\n{2,}/); // Split by two or more newlines
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

const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Journal Export</title>
<style>
  body {
    font-family: sans-serif;
    margin: 1in;
    column-count: 2;
    column-gap: 2em;
  }
  .entry {
    break-inside: avoid;
    margin-bottom: 2em;
  }
  .entry-date {
    margin-bottom: 0.2em;
    font-size: 1.2em;
  }
  .entry-meta {
    margin-bottom: 0.5em;
    color: #555;
  }
  .entry-photo {
    margin: 1em 0;
    text-align: center;
  }
  .entry-photo img {
    max-width: 100%;
    height: auto;
  }
</style>
</head>
<body>
${entries.map(convertEntryToHTML).join('\n')}
</body>
</html>`;

fs.writeFileSync(outputPath, fullHTML);
console.log(`✅ Exported HTML journal to ${outputPath}`);
