import REPLACERS from "../../../../../../../htmlReplacers.json";

export function handleSingleNewlines(input: string): string {
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
            */
        /(?<!\n)\n(?!\n)(?= *(?![*\-+>|] |\d+\. |\||[:|\- ]+\|)\S)/g,
        `\n\n${REPLACERS.singleNewlineParagraph.tag}`
    );
}
