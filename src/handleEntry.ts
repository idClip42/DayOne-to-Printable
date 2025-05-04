import { DayOneEntry } from "../types/DayOneEntry";
import { marked } from 'marked';
import { CreateImageHtml, ImageTokenMatch, ImageTokenSplit } from "./handleImage";
import { CreateMetadataHtml } from "./handleEntryMeta";

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

    html += CreateMetadataHtml(entry);

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