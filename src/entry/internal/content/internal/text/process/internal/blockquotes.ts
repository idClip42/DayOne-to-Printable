import REPLACERS from "../../../../../../../htmlReplacers.json";

const REQUIRE_WHITESPACE_AFTER_PREFIX = true;

export function fixBlockquotes(input: string): string {
    let output = input
        .replace(
            // Newlines immediately followed by U-2028
            // get turned into double newlines.
            /\n\u2028/g,
            "\n\n"
        )
        .replace(
            /^([ \t]*)> ([^\n]*)$/gm,
            // Replace any U+2028 that appears *within a single blockquote line* by splitting it into
            // a new quoted line: "\n{same indent}> "
            //
            // Handles multiple U+2028s on the same quote line and will NOT cross line boundaries.
            (full, indent, content) =>
                `${indent}> ${content.replace(/\u2028/g, `\n${indent}> `)}`
        );

    output = fillQuoteRuns(output);

    output = output
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
        .replace(
            // 7.1: Unicode Line Separator Normalization
            // U+2028 appears to be an unusual newline that is showing up in my stuff sometimes.
            // This is the quote block version.
            /(^>.*)\u2028/gm,
            "$1\n> "
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

function fillQuoteRuns(md: string): string {
    // NOTE: Do NOT normalize \r here; caller will handle carriage returns separately.
    const lines = md.split("\n");

    let inFence = false;

    const isFence = (s: string) => /^\s*```/.test(s);

    // Two modes (as you described):
    // - whitespace->-nowhitespace:   /^\s*>[^\s]/  (i.e., ">" followed by a non-whitespace char)
    // - whitespace->-whitespace:     /^\s*>\s/     (i.e., ">" followed by whitespace)
    //
    // For this function we treat "quote line" as:
    // - REQUIRE_WHITESPACE_AFTER_PREFIX === true  => only match whitespace->-whitespace
    // - REQUIRE_WHITESPACE_AFTER_PREFIX === false => match either form (any line that begins with optional ws + ">")
    const isQuote = (s: string) =>
        REQUIRE_WHITESPACE_AFTER_PREFIX ? /^\s*>\s/.test(s) : /^\s*>/.test(s);

    const isBlank = (s: string) => /^\s*$/.test(s);

    // When we need to add a quote marker, preserve any leading indentation already present.
    // (If you truly want ">" as the first character always, change this to: (s) => `> ${s}`)
    const addQuotePrefix = (s: string) => s.replace(/^(\s*)/, "$1> ");

    for (let i = 0; i < lines.length; i++) {
        // Skip fenced code blocks entirely.
        if (isFence(lines[i])) {
            inFence = !inFence;
            continue;
        }
        if (inFence) continue;

        // Start of a quote run.
        if (!isQuote(lines[i])) continue;

        // Walk forward until a blank line (ends the quote run per your corpus assumption),
        // prefixing any non-blank lines that are missing the quote marker.
        let k = i + 1;
        for (; k < lines.length; k++) {
            if (isFence(lines[k])) break;

            if (isBlank(lines[k])) break;

            if (!isQuote(lines[k])) {
                // Now we have to figure out if `lines[k]` is intended as a quote.

                const isLastLine = k === lines.length - 1;
                if (isLastLine) {
                    // If the last line isn't quote-blocked,
                    // it's not a quote.
                    // But let's add an extra newline to
                    // separate it.
                    lines[k] =
                        "\n" + /* "[[QUOTE_ADDED_LAST_LINE]]" + */ lines[k];
                    break;
                }
                // const nextLine = lines[k + 1];

                const prevLine = lines[k - 1];
                const prevHasBlankQuote = prevLine.trim() === ">";
                if (prevHasBlankQuote) {
                    // If there's a blank quote line and then a non-quote line,
                    // this line  was intended as part of the quote.
                    // TODO: We should see evidence of this in the "cat" entry.
                    lines[k] = addQuotePrefix(
                        /* "[[QUOTE_ADDED_PREV_BLANK]]" + */ lines[k]
                    );
                    // We also assume that this is the last line of the
                    // quote.
                    break;
                }

                const nextLines = lines.slice(k);
                const nextEmptyLine = nextLines.findIndex(l => l.trim() === "");
                const nextQuoteLine = nextLines.findIndex(l =>
                    l.trim().startsWith(">")
                );

                const anyMoreQuotes = nextQuoteLine > 0;
                const anyMoreEmpties = nextEmptyLine > 0;
                const breakBeforeNextQuote =
                    !anyMoreQuotes ||
                    (anyMoreEmpties && nextEmptyLine < nextQuoteLine);

                if (breakBeforeNextQuote) {
                    // If there's an empty line before the next quote block,
                    // or if there text ends with no more quote blocks,
                    // then this ain't gonna be a quote.
                    // And we should probably separate it from the pack.
                    lines[k] = "\n" + /* "[[QUOTE_ADDED_END]]" + */ lines[k];
                    break;
                } else {
                    // Otherwise, we are coming up on another quote block
                    // without any kind of interruption.
                    // Which means we gotta fill in
                    lines[k] = addQuotePrefix(
                        /* "[[QUOTE_ADDED_UPCOMING]]" + */ lines[k]
                    );
                }
            }
        }

        // Advance to end of run so we don't re-scan the same block repeatedly.
        i = k - 1;
    }

    return lines.join("\n");
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
