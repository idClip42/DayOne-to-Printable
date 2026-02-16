import REPLACERS from "../../../../../../../htmlReplacers.json";

export function fixBlockquotes(input: string): string {
    let output = input
        .replace(
            /^([ \t]*)> ([^\n]*)$/gm,
            // Replace any U+2028 that appears *within a single blockquote line* by splitting it into
            // a new quoted line: "\n{same indent}> "
            // Handles multiple U+2028s on the same quote line and will NOT cross line boundaries.
            // `sanitize.ts` also handles U-2028.
            (full, indent, content) =>
                `${indent}> ${content.replace(/\u2028/g, `\n${indent}> `)}`
        )
        .replace(
            // For any blockquote line (line begins with optional indent + ">" + optional space),
            // replace carriage returns (\r) within that line with a newline + same indent + "> ",
            // effectively splitting it into multiple quoted lines.
            /^([ \t]*> ?[^\n]*)$/gm,
            line => {
                const m = line.match(/^([ \t]*)>( ?)([^\n]*)$/);
                if (!m) return line;
                const indent = m[1];
                const spaceAfter = m[2]; // either " " or ""
                const rest = m[3];

                // Preserve whether the original used "> " or ">" when inserting the continuation.
                return `${indent}>${spaceAfter}${rest.replace(/\r/g, /* "[[BACKSLASH_R_QUOTE]]" + */ `\n${indent}>${spaceAfter}`)}`;
            }
        )
        .replace(
            // Collapse any nested quote prefix to a single "> ".
            // Examples it fixes:
            //   ">> hello"      -> "> hello"
            //   "> > hello"     -> "> hello"
            //   ">    > hello"  -> "> hello"
            //   ">>> hello"     -> "> hello"
            /^([^\S\r\n]*)>(?:[^\S\r\n]*>)+[^\S\r\n]*/gm,
            "$1> "
        )
        .replace(
            // 24: Horizontal Rules Inside Quotes
            // Some horizontal rules are in quote blocks. This fixes those entirely.
            /> ---/g,
            "> <hr>"
        )
        .replace(
            // Ensure exactly ONE empty line after the end of a blockquote run
            // - Match a quote line
            // - Next line must NOT start another quote line
            // - Replace any number of blank lines following with exactly one blank line
            // but only if there is more non-whitespace content later (avoid trailing blanks at EOF).
            /(^[ \t]*>.*\n)(?![ \t]*>)(?:[ \t]*\n)*(?=\S)/gm,
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
            /^>\s*.*$/gm,
            line => line.replace(/\\([^\\])/g, "$1")
        );

    output = handleSingleNewlinesInsideBlockquotes(output);

    output = output.replace(
        // Insert a blank line between a non-quote text line and a following quote line.
        // (Won't fire if there's already a blank line, because then the next char is "\n", not ">".)
        /^(?![ \t]*>)(?!\s*$)([^\n]*\S[^\n]*)\n(?=[ \t]*>\s)/gm,
        "$1\n\n"
    );

    return output;
}

function handleSingleNewlinesInsideBlockquotes(md: string): string {
    // Match:
    //   > nonblank text\n
    //   > nonblank text   (where the 2nd line is NOT a list/table/nested-quote start)
    const re =
        /(^[ \t]*> (?!\s*$)[^\n]*\S[^\n]*)\n([ \t]*> )(?!\s*$)(?![ \t]*(?:[*\-+]\s|\d+\.\s|>|\||[:|\- ]+\|))([^\n]*)/gm;

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
