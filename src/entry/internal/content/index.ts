import { marked } from "marked";
import { DayOneEntry } from "../../../types/DayOneEntry";
import { processHtmlImages } from "./internal/images";
import config from "../../../../config.json";
import { replaceHtmlTextWithLoremIpsum } from "./internal/loremIpsum";
import { preprocessText } from "./internal/text/preprocess";
import { processText } from "./internal/text/process";
import HTML_REPLACERS from "./../../../htmlReplacers.json";
import { highlightExtension } from "./internal/text/marked/highlightExtension";

const REGEX_TABLE_BLOCK = /```[\s\n]*\|.*\|.*\n.*```/;

export async function createContentHtml(entry: DayOneEntry): Promise<string> {
    const preprocessedText = preprocessText(entry.text);

    if (REGEX_TABLE_BLOCK.test(preprocessedText)) {
        console.log(
            `⚠️ Possible table-in-code-block found in '${new Date(entry.creationDate).toLocaleString()}'`
        );
    }

    const processedText = await processText(preprocessedText, entry);

    marked.use({ extensions: [highlightExtension] });

    // Parse the modified Markdown into HTML.
    let htmlResult = await marked.parse(processedText);

    for (const key in HTML_REPLACERS) {
        const replacer = HTML_REPLACERS[key as keyof typeof HTML_REPLACERS];
        htmlResult = htmlResult.replace(
            new RegExp(replacer.find, "g"),
            replacer.replace
        );
    }

    // Update all image tags.
    htmlResult = await processHtmlImages(entry, htmlResult);
    // Replace all text content with Lorem Ipsum,
    // if configured to do so.
    if (config.content.obfuscate) {
        htmlResult = replaceHtmlTextWithLoremIpsum(htmlResult);
    }

    return htmlResult;
}
