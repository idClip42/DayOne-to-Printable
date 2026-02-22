import chalk from "chalk";
import REPLACERS from "../../../../../../../htmlReplacers.json";
import { DayOneEntry } from "../../../../../../../types/DayOneEntry";

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
            const beforeNewline = fullStr.substring(0, offset);
            const afterNewline = fullStr.substring(offset);

            const backtickInstancesBefore =
                beforeNewline.match(REGEX_TRIPLE_BACKTICKS)?.length ?? 0;
            const backtickInstancesAfter =
                afterNewline.match(REGEX_TRIPLE_BACKTICKS)?.length ?? 0;

            const beforeIsEven = backtickInstancesBefore % 2 === 0;
            const afterIsEven = backtickInstancesAfter % 2 === 0;

            // These should match - if they don't, there's a problem.
            if (beforeIsEven !== afterIsEven) {
                console.warn(
                    chalk.yellow(
                        `${entry ? new Date(entry.creationDate).toLocaleString() : "NO DATE"}: Backticks count even/odd mismatch - ${backtickInstancesBefore} vs ${backtickInstancesAfter}.`
                    )
                );
                return match;
            }

            // If there's an odd number of before backticks, we're mid-code-block.
            if (!beforeIsEven) return match;

            // Otherwise, we're not in a code block and can add the tag.
            return `\n\n${REPLACERS.singleNewlineParagraph.tag}`;
        }
    );
}
