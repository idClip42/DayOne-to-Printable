import { marked } from "marked";
import { DayOneEntry } from "../types/DayOneEntry";
import { CreateImageHtml, ImageTokenMatch, ImageTokenSplit } from "./handleEntryContentImage";

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

export function CreateContentHtml(entry:DayOneEntry):string{
    let htmlResult = "";

    const preprocessedText = preprocessEntryText(entry.text);
    const paragraphs = preprocessedText.split(/\n{2,}/);

    for (let paragraph of paragraphs) {
        // Replace single returns after blockquotes ("> TEXT\n") with a double return for separation
        paragraph = paragraph.replace(/>[^>].*\n(?!>)/g, match => match + '\n');
    
        // Break paragraph into segments: either image matches or plain text
        const tokens = paragraph.split(ImageTokenSplit);
        for (const token of tokens) {
            const imgMatch = token.match(ImageTokenMatch);
            if (imgMatch) {
                htmlResult += CreateImageHtml(entry, imgMatch[1]);
            } else if (token.trim()) {
                // Replace single newlines (no newline before or after them) with <br> and parse with marked
                const withBreaks = token.replace(/(?<!\n)\n(?!\n)/g, '<br>\n');
                htmlResult += marked.parse(withBreaks);
            }
        }
    }
    
    return htmlResult;
}