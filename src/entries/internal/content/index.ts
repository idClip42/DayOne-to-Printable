import { marked } from "marked";
import { DayOneEntry } from "../../../types/DayOneEntry";
import { ProcessHtmlImages } from "./internal/images";
import CONFIG from "../../../../config.json";
import { ReplaceHtmlTextWithLoremIpsum } from "./internal/loremIpsum";
import { UpdateHtmlAttachments } from "./internal/attachments/html";
import { PreprocessText } from "./internal/text/preprocess";
import { ProcessText } from "./internal/text/process";

export function CreateContentHtml(entry: DayOneEntry): string {
    const preprocessedText = PreprocessText(entry.text);

    if (/```[\s\n]*\|.*\|.*\n.*```/.test(preprocessedText)) {
        console.log(
            `⚠️ Possible table-in-code-block found in '${new Date(entry.creationDate).toLocaleString()}'`
        );
    }

    const processedText = ProcessText(preprocessedText, entry);

    // Parse the modified Markdown into HTML.
    let htmlResult = marked.parse(processedText, { async: false });
    // Update all image tags.
    htmlResult = ProcessHtmlImages(entry, htmlResult);
    // Update attachments.
    htmlResult = UpdateHtmlAttachments(htmlResult);
    // Replace all text content with Lorem Ipsum,
    // if configured to do so.
    if (CONFIG.CONTENT.CONTENT.LOREM_IPSUM_MODE) {
        htmlResult = ReplaceHtmlTextWithLoremIpsum(htmlResult);
    }

    return htmlResult;
}
