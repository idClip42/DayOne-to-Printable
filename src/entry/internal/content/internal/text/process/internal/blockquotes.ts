import REPLACERS from "../../../../../../../htmlReplacers.json";

const REGEX_U_2028_A = /^([ \t]*)> ([^\n]*)$/gm;
const REGEX_U_2028_B = /\u2028/g;
const REGEX_CARRIAGE_RETURN_A = /^([ \t]*> ?[^\n]*)$/gm;
const REGEX_CARRIAGE_RETURN_B = /^([ \t]*)>( ?)([^\n]*)$/;
const REGEX_CARRIAGE_RETURN_C = /\r/g;
const REGEX_NESTED_QUOTES = /^([^\S\r\n]*)>(?:[^\S\r\n]*>)+[^\S\r\n]*/gm;
const REGEX_HORIZONTAL_RULES = /> ---/g;
const REGEX_ONE_EMPTY_LINE =
    /(?<!```.*\n)(^[ \t]*>.*\n)(?![ \t]*>)(?:[ \t]*\n)*(?=\S)/gm;
const REGEX_BACKSLASH_A = /^>\s*.*$/gm;
const REGEX_BACKSLASH_B = /\\([^\\])/g;
const REGEX_BLANK_LINE =
    /^(?![ \t]*>)(?!\s*$)([^\n]*\S[^\n]*)\n(?=[ \t]*>\s)/gm;
const REGEX_SINGLE_NEWLINE =
    /(^[ \t]*> (?!\s*$)[^\n]*\S[^\n]*)\n([ \t]*> )(?!\s*$)(?![ \t]*(?:[*\-+]\s|\d+\.\s|>|\||[:|\- ]+\|))([^\n]*)/gm;

export function fixBlockquotes(input: string): string {
    let output = input
        .replace(
            REGEX_U_2028_A,
            // Replace any U+2028 that appears *within a single blockquote line* by splitting it into
            // a new quoted line: "\n{same indent}> "
            // Handles multiple U+2028s on the same quote line and will NOT cross line boundaries.
            // `sanitize.ts` also handles U-2028.
            (full, indent, content) =>
                `${indent}> ${content.replace(REGEX_U_2028_B, `\n${indent}> `)}`
        )
        .replace(
            // For any blockquote line (line begins with optional indent + ">" + optional space),
            // replace carriage returns (\r) within that line with a newline + same indent + "> ",
            // effectively splitting it into multiple quoted lines.
            REGEX_CARRIAGE_RETURN_A,
            line => {
                const m = line.match(REGEX_CARRIAGE_RETURN_B);
                if (!m) return line;
                const indent = m[1];
                const spaceAfter = m[2]; // either " " or ""
                const rest = m[3];

                // Preserve whether the original used "> " or ">" when inserting the continuation.
                return `${indent}>${spaceAfter}${rest.replace(REGEX_CARRIAGE_RETURN_C, /* "[[BACKSLASH_R_QUOTE]]" + */ `\n${indent}>${spaceAfter}`)}`;
            }
        )
        .replace(
            // Collapse any nested quote prefix to a single "> ".
            // Examples it fixes:
            //   ">> hello"      -> "> hello"
            //   "> > hello"     -> "> hello"
            //   ">    > hello"  -> "> hello"
            //   ">>> hello"     -> "> hello"
            REGEX_NESTED_QUOTES,
            "$1> "
        )
        .replace(
            // 24: Horizontal Rules Inside Quotes
            // Some horizontal rules are in quote blocks. This fixes those entirely.
            REGEX_HORIZONTAL_RULES,
            "> <hr>"
        )
        .replace(
            // Ensure exactly ONE empty line after the end of a blockquote run
            // - Match a quote line
            // - Next line must NOT start another quote line
            // - Replace any number of blank lines following with exactly one blank line
            // but only if there is more non-whitespace content later (avoid trailing blanks at EOF).
            REGEX_ONE_EMPTY_LINE,
            "$1\n"
        )
        // TODO: Don't think we need this
        // .replace(
        //     // 7.1: Unicode Line Separator Normalization
        //     // U+2028 appears to be an unusual newline that is showing up in my stuff sometimes.
        //     // This is the quote block version.
        //     /(^>.*)\u2028/gm,
        //     "$1\n> "
        // )
        .replace(
            // 21: Quote Line Backslash Cleanup
            // Backslashes at this point are unprocessed markdown, and we can kill
            // all of them unless they're escaping another backslash.
            REGEX_BACKSLASH_A,
            line => line.replace(REGEX_BACKSLASH_B, "$1")
        );

    output = handleSingleNewlinesInsideBlockquotes(output);

    output = output.replace(
        // Insert a blank line between a non-quote text line and a following quote line.
        // (Won't fire if there's already a blank line, because then the next char is "\n", not ">".)
        REGEX_BLANK_LINE,
        match => {
            // We need to stop this happening
            // when this is a code block line.
            // Due to the oddities of DayOne
            // code blocks, we can check for
            // that with this:
            if (match.trim().startsWith("```")) return match;

            return match + "\n";
        }
    );

    return output;
}

function handleSingleNewlinesInsideBlockquotes(md: string): string {
    // Match:
    //   > nonblank text\n
    //   > nonblank text   (where the 2nd line is NOT a list/table/nested-quote start)
    const re = REGEX_SINGLE_NEWLINE;

    let prev: string;
    do {
        prev = md;
        // Turn single-newline separation into:
        //   > line1
        //   >
        //   > TAGline2
        md = md.replace(
            re,
            `$1\n$2\n$2${REPLACERS.singleNewlineParagraph.tag}$3`
        );
    } while (md !== prev);

    return md;
}
