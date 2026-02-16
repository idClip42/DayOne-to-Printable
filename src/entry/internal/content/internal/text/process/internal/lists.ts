import REPLACERS from "./../../../../../../../htmlReplacers.json";

const REGEX_LIST_GAP = /(^[ \t]*[-*+]\s.*\r?\n)(\r?\n)(?=[ \t]*[-*+]\s)/gm;
const REGEX_TWO_NEWLINES_A = /(^|\n)([^\n]*?)\n+(?=^[ \t]*[-*] )/gm;
const REGEX_TWO_NEWLINES_B = /^[ \t]*[-*] /;
const REGEX_PARENTS_A = /(^|\n)(?![\t]*[-*+] )[^\n]*\n(\t+[-*+] .*)/g;
const REGEX_PARENTS_B = /^\t+/;
const REGEX_PARENTS_C = /\n(\t+[-*+] .*)$/;
const REGEX_CARRIAGE_RETURN_A = /^([ \t]*[*+-] [^\n]*)$/gm;
const REGEX_CARRIAGE_RETURN_B = /\r/g;

export function fixLists(input: string): string {
    return input
        .replace(
            // Match an empty line (\n or \r\n) that is between two markdown bullets.
            // Put a temporary element between them, which we'll hide later.
            // Otherwise, the gap breaks the whole list.
            REGEX_LIST_GAP,
            `$1\n${REPLACERS.midListBreak.tag}\n`
        )
        .replace(
            // 16.1: All lists must have two newlines before them.
            REGEX_TWO_NEWLINES_A,
            (match, prefix, line, offset, full) => {
                if (offset === 0) return match;

                if (REGEX_TWO_NEWLINES_B.test(line)) {
                    // previous line is list item → inside list
                    return match;
                }

                return prefix + line + "\n\n";
            }
        )
        .replace(
            // Fix orphaned nested list items by inserting ALL missing parent bullets
            REGEX_PARENTS_A,

            (match, lineStart, nestedBulletLine) => {
                // Count how many tabs precede the bullet
                const tabCount =
                    nestedBulletLine.match(REGEX_PARENTS_B)?.[0].length ?? 0;

                // Build placeholder parent bullets for every missing ancestor level
                let placeholders = "";
                for (let i = 0; i < tabCount; i++) {
                    placeholders += `${"\t".repeat(i)}- ${REPLACERS.hiddenParentBullet.tag}\n`;
                }

                // Insert placeholders between the non-bullet line and the nested bullet
                return match.replace(REGEX_PARENTS_C, `\n${placeholders}$1`);
            }
        )
        .replace(
            // Replace all *carriage return characters* (\r) that occur within an unordered list item line
            // (lines that start with optional indent + (*|-|+) + space).
            REGEX_CARRIAGE_RETURN_A,
            line =>
                line.replace(
                    REGEX_CARRIAGE_RETURN_B,
                    /* "[[BACKSLASH_R_BR]]" + */ "<br>"
                )
        );
}
