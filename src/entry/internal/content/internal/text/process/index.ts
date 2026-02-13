import { DayOneEntry } from "../../../../../../types/DayOneEntry";
import { sanitizeInput } from "./sanitize";
import { cleanStructure } from "./structure";
import { fixLists } from "./lists";
import { fixBlockquotes } from "./blockquotes";
import { fixCode } from "./code";
import { fillInAttachments } from "./attachments";
import { cleanBackslashes } from "./backslashes";
import { handleExtensions } from "./extensions";
import { handleSingleNewlines } from "./singleNewlines";

export function processText(
    inputText: string,
    entry: DayOneEntry | null
): string {
    let output = inputText;
    output = sanitizeInput(output);
    output = cleanStructure(output);
    output = fixLists(output);
    output = fixBlockquotes(output);
    output = fixCode(output);
    output = fillInAttachments(output, entry);
    output = cleanBackslashes(output);
    output = output.replace(
        // 7.2: Unicode Line Separator Normalization
        // U+2028 appears to be an unusual newline that is showing up in my stuff sometimes.
        // This is the regular version.
        /\u2028/g,
        `\n`
    );
    output = handleSingleNewlines(output);
    output = handleExtensions(output);
    return output;
}
