const REQUIRE_WHITESPACE_AFTER_PREFIX = true;

export function fixBlockquotes(input: string): string {
    let output = fillQuoteRuns(input);
    output = output.replace(
        // Collapse any nested quote prefix to a single "> ".
        // Examples it fixes:
        //   ">> hello"      -> "> hello"
        //   "> > hello"     -> "> hello"
        //   ">    > hello"  -> "> hello"
        //   ">>> hello"     -> "> hello"
        /^([^\S\r\n]*)>(?:[^\S\r\n]*>)+[^\S\r\n]*/gm,
        "$1> "
    );
    output = output.replace(
        // 24: Horizontal Rules Inside Quotes
        // Some horizontal rules are in quote blocks. This fixes those entirely.
        /> ---/g,
        "> <hr>"
    );
    output = output.replace(
        // Ensure exactly ONE empty line after the end of a blockquote run
        // - Match a quote line
        // - Next line must NOT start another quote line
        // - Replace any number of blank lines following with exactly one blank line
        // but only if there is more non-whitespace content later (avoid trailing blanks at EOF).
        /(^[ \t]*>.*\n)(?![ \t]*>)(?:[ \t]*\n)*(?=\S)/gm,
        "$1\n"
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

            if (!isQuote(lines[k])) lines[k] = addQuotePrefix(lines[k]);
        }

        // Advance to end of run so we don't re-scan the same block repeatedly.
        i = k - 1;
    }

    return lines.join("\n");
}
