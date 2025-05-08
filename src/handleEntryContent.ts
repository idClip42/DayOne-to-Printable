import { marked } from "marked";
import { DayOneEntry } from "../types/DayOneEntry";
import { CreateImageHtml, ImageTokenMatch, ImageTokenSplit } from "./handleEntryContentImage";
import CONFIG from "./../config.json";
import { ReplaceHtmlTextWithLoremIpsum } from "./loremIpsumReplacer";

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

    for(let p = 0; p < paragraphs.length; ++p) {
        let paragraph = paragraphs[p];
        // Replace single returns after blockquotes ("> TEXT\n") with a double return for separation
        paragraph = paragraph.replace(/>[^>].*\n(?!>)/g, match => match + '\n');
    
        // Break paragraph into segments: either image matches or plain text
        const tokens = paragraph.split(ImageTokenSplit);
        for(let t = 0; t < tokens.length; ++t) {
            const token = tokens[t];
            const imgMatch = token.match(ImageTokenMatch);
            if (imgMatch) {
                htmlResult += CreateImageHtml(entry, imgMatch[1]);
            } else if (token.trim()) {
                // Replace single newlines (no newline before or after them) with <br> and parse with marked
                const BREAK = '<br>\n';
                const withBreaks = token.replace(/(?<!\n)\n(?!\n)/g, BREAK);
                let html = marked.parse(withBreaks, {"async": false});
                if(CONFIG.LOREM_IPSUM_MODE){
                    html = ReplaceHtmlTextWithLoremIpsum(html);
                }
                htmlResult += html;
            }
        }
    }
    
    return htmlResult;
}