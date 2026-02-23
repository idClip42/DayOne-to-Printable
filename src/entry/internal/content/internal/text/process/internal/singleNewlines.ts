import chalk from "chalk";
import REPLACERS from "../../../../../../../htmlReplacers.json";
import { DayOneEntry } from "../../../../../../../types/DayOneEntry";
import { isInCodeBlock } from "./utils";

const REGEX_SINGLE_NEWLINES =
    /(?<!\n)\n(?!\n)(?= *(?![*\-+>|] |\d+\. |\||[:|\- ]+\|)\S)/g;
const REGEX_TRIPLE_BACKTICKS = /```/g;

export function handleSingleNewlines(
    input: string,
    entry: DayOneEntry | null
): string {
    return input.replace(
        // 5: Single-Newline Conversion
        // Replace single `\n` (not followed by a list item, blockquote, or table line)
        // with double newlines and a tag to mark it so the HTML can be updated later.
        /*
                Breakdown:
                - `(?<!\n)` — Not preceded by another newline (we're not in a blank line).
                - `\n` — The newline we might want to replace.
                - `(?!\n)` — Not followed by another newline (avoiding paragraph breaks).
                - `(?= *(?![*\-+>|] |\d+\. )` — Lookahead ensures:
                    - Optional leading spaces
                    - NOT:
                        - a bullet list item (*, -, + followed by space)
                        - a blockquote (`> `)
                        - a numbered list (`1. `)
                        - a table row (starting with `|`)
                        - a table alignment row (like `|:---|:---|`)
                    - `\S` — Next character must be non-whitespace
                - Extra internal logic ensures this is not within a code block.
            */
        REGEX_SINGLE_NEWLINES,
        (match: string, offset: number, fullStr: string) => {
            if (isInCodeBlock(fullStr, offset, entry)) return match;
            return `\n\n${REPLACERS.singleNewlineParagraph.tag}`;
        }
    );
}
