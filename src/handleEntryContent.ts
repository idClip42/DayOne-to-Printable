import { marked } from "marked";
import { DayOneEntry } from "../types/DayOneEntry";
import { CreateImageHtml, GetImageFilePath, ImageTokenMatch, ImageTokenSplit, ImageTokenMatchAll, ProcessHtmlImages } from "./handleEntryContentImage";
import CONFIG from "./../config.json";
import { ReplaceHtmlTextWithLoremIpsum } from "./loremIpsumReplacer";

function preprocessEntryText(text: string): string {
    // Trim leading/trailing whitespace
    const trimmed = text.trim();

    // Find first line break
    const firstNewlineIndex = trimmed.indexOf('\n');
    const firstLine = firstNewlineIndex === -1 ? trimmed : trimmed.slice(0, firstNewlineIndex);

    if(firstLine.startsWith('#')){
        // const results = `${firstLine}\n${trimmed.slice(firstNewlineIndex)}`;
        // return results;
    }
    // If the first line doesn't start with a markdown header but is short enough, prepend "# "
    else if (firstLine.length <= 100) {
        const result = `# ${firstLine}\n\n${trimmed.slice(firstNewlineIndex)}`;
        // console.log(JSON.stringify(result));
        // throw "stop";
        return result;
    }

    return trimmed;
}

export function CreateContentHtml(entry:DayOneEntry):string{
    let htmlResult = "";

    const preprocessedText = preprocessEntryText(entry.text);
    // console.log(JSON.stringify(preprocessedText));

    const processedText = preprocessedText.replace(
        // Add an extra return after every header line of any level
        /(^#{1,}.*\n)/gm, 
        (match) => {
            // console.log(match);
            return match + '\n';
        }
    ).replace(
        // Replace single `\n` (with a letter after it) with <br>
        /(?<!\n)\n(?!\n)(?=[A-Za-z])/g, "<br>"
    ).replace(
        // Add extra newlines at end of ">" block quotes
        />[^>].*\n(?!>)/g, match => match + '\n'
    ).replace(
        // Remove extra newlines from around images
        // (to fix bulleted lists)
        /\n\n!?\[\]\((.*?)\)\n\n/g,
        (_, url) => {
            return ` ![](${url})\n`;
        }
    ).replace(
        // Fix all image links
        ImageTokenMatchAll,
        (_, match) => {
            return `![](${GetImageFilePath(entry, match)})`
        }
    );
    // console.log(JSON.stringify(processedText));
    // console.log(processedText.slice(0,2000));

    let html = marked.parse(
        processedText, {"async": false}
    ); //.replace(/<img([^>]*)>/g, (match, p1) => {
        // return `<div class="entry-photo"><img${p1}></div>`;
    // });

    html = ProcessHtmlImages(entry, html);

    // console.log(html);
    // htmlResult += html;

    // const paragraphs = preprocessedText.split(/\n{2,}/);

    // for(let p = 0; p < paragraphs.length; ++p) {
    //     let paragraph = paragraphs[p];
    //     // Replace single returns after blockquotes ("> TEXT\n") with a double return for separation
    //     paragraph = paragraph.replace(/>[^>].*\n(?!>)/g, match => match + '\n');
    
    //     // Break paragraph into segments: either image matches or plain text
    //     // const tokens = paragraph.split(ImageTokenSplit);
    //     const tokens = [ paragraph ]
    //     for(let t = 0; t < tokens.length; ++t) {
    //         const token = tokens[t];
    //         const imgMatch = false; // token.match(ImageTokenMatch);
    //         if (imgMatch) {
    //             htmlResult += CreateImageHtml(entry, imgMatch[1]);
    //         } else if (token.trim()) {
    //             // Replace single newlines (no newline before or after them) with <br> and parse with marked
    //             // const BREAK = '<br>\n';
    //             // const withBreaks = token.replace(/(?<!\n)\n(?!\n)/g, BREAK);
    //             let html = marked.parse(token, {"async": false});
                if(CONFIG.ENTRIES.CONTENT.LOREM_IPSUM_MODE){
                    html = ReplaceHtmlTextWithLoremIpsum(html);
                }
                htmlResult += html;
            // }
    //     }
    // }
    
    return htmlResult;
}