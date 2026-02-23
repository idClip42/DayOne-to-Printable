import type { DayOneEntry } from "../../../../../../../types/DayOneEntry";
import { isInCodeBlock } from "./utils";

const REGEX_ESC_HR = /\\-\\-\\-/g;
const REGEX_BULLET = /(?<=\n\s*>?\s*)•/g;
const REGEX_U_2028 = /\n\u2028/g;

export function sanitizeInput(
    input: string,
    entry: DayOneEntry | null
): string {
    return input
        .replace(
            // 25: Escaped Horizontal Rule Cleanup
            // Apparently we've got some "\-\-\-" in there too.
            REGEX_ESC_HR,
            "---"
        )
        .replace(
            // 15: Unicode Bullet Normalization
            // There's at least one copy-pasted list with
            // actual unicode bullets that isn't interpreted
            // as a list and becomes one line in the HTML.
            // Of note:
            // - Sometimes these lists will be in block quotes
            // - Sometimes there will be indentation whitespace
            REGEX_BULLET,
            "-"
        )
        .replace(
            // Newlines immediately followed by U-2028
            // get turned into double newlines.
            // `blockquotes.ts` also handles U-2028.
            REGEX_U_2028,
            "\n\n"
        )
        .replace(
            // We need to make sure that the browser doesn't read
            // tag-looking things as HTML.
            /<[^>\n]*>/g,
            (match: string, offset: number, fullStr: string) => {
                if (isInCodeBlock(fullStr, offset, entry)) return match;
                return match.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            }
        );
}
