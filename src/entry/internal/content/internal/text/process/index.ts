import { DayOneEntry } from "../../../../../../types/DayOneEntry";
import { sanitizeInput } from "./internal/sanitize";
import { cleanStructure } from "./internal/structure";
import { fixLists } from "./internal/lists";
import { fixBlockquotes } from "./internal/blockquotes";
import { fixCode } from "./internal/code";
import { fillInAttachments } from "./internal/attachments";
import { cleanBackslashes } from "./internal/backslashes";
import { handleExtensions } from "./internal/extensions";
import { handleSingleNewlines } from "./internal/singleNewlines";

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
