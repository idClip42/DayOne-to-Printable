import { DayOneEntry } from "../types/DayOneEntry";
import { formatDateTime } from "./dateUtilities";
import { marked } from 'marked';
import { CreateImageHtml, ImageTokenMatch, ImageTokenSplit } from "./handleImage";

function celsiusToFahrenheit(c: number) {
    return Math.round((c * 9) / 5 + 32);
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

export function convertEntryToHTML(entry: DayOneEntry): string {
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
        const tokens = paragraph.split(ImageTokenSplit);
    
        for (const token of tokens) {
            const imgMatch = token.match(ImageTokenMatch);
            if (imgMatch) {
                html += CreateImageHtml(entry, imgMatch[1]);
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