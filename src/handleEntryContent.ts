import { marked } from "marked";
import { DayOneEntry } from "../types/DayOneEntry";
import { GetImageFilePath, ProcessHtmlImages } from "./handleEntryContentImage";
import CONFIG from "./../config.json";
import { ReplaceHtmlTextWithLoremIpsum } from "./loremIpsumReplacer";

export function CreateContentHtml(entry:DayOneEntry):string{
    let htmlResult = "";

    const preprocessedText = (()=>{
        // Trim leading/trailing whitespace.
        const trimmed = entry.text.trim();
        // Find first line break.
        const firstNewlineIndex = trimmed.indexOf('\n');
        const firstLine = firstNewlineIndex === -1 ? trimmed : trimmed.slice(0, firstNewlineIndex);
        // If the first line doesn't start with a markdown
        // header but is short enough, prepend "# ".
        if (! firstLine.startsWith('#') && firstLine.length <= 100) {
            return `# ${firstLine}\n\n${trimmed.slice(firstNewlineIndex)}`;
        }
        // Otherwise, just return it as is.
        return trimmed;
    })();

    const processedText = preprocessedText.replace(
        // Add an extra return after every header line of any level.
        // This makes absolutely sure that no body text is also formatted
        // like a header.
        /(^#{1,}.*\n)/gm, 
        (match) => match + '\n'
    ).replace(
        // Replace single `\n` (with a letter after it) with <br>.
        // This makes sure every single newline that's part of a paragraph
        // is treated as a simple newline and not a paragraph break
        // when everything is parsed into HTML.
        /(?<!\n)\n(?!\n)(?=[A-Za-z])/g, 
        "<br>"
    ).replace(
        // Add extra newlines at end of ">" block quotes.
        // This makes sure commentary after block quotes
        // (without an extra newline to separate it out)
        // doesn't get merged in with the block quotes.
        />[^>].*\n(?!>)/g, 
        match => match + '\n'
    ).replace(
        // Remove extra newlines from around images.
        // This allows images dropped in the middle of
        // bulleted lists to not interrupt those lists,
        // and shouldn't affect any images that aren't
        // in bulleted lists.
        /\n\n!?\[\]\((.*?)\)\n\n/g,
        (_, url) => ` ![](${url})\n`
    ).replace(
        // Replaces all DayOne image links with the link
        // to the actual relevant image.
        /!\[]\(dayone-moment:\/\/(.*?)\)/g,
        (_, match) => `![](${GetImageFilePath(entry, match)})`
    );

    // Parse the modified Markdown into HTML.
    htmlResult = marked.parse(
        processedText, {"async": false}
    );

    // Update all image tags.
    htmlResult = ProcessHtmlImages(entry, htmlResult);
    
    // Replace all text content with Lorem Ipsum,
    // if configured to do so.
    if(CONFIG.ENTRIES.CONTENT.LOREM_IPSUM_MODE){
        htmlResult = ReplaceHtmlTextWithLoremIpsum(htmlResult);
    }

    return htmlResult;
}