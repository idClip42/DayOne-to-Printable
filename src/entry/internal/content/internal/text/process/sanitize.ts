export function sanitizeInput(input: string): string {
    return input
        .replace(
            // 25: Escaped Horizontal Rule Cleanup
            // Apparently we've got some "\-\-\-" in there too.
            /\\-\\-\\-/g,
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
            /(?<=\n\s*>?\s*)•/g,
            "-"
        )
        .replace(
            // 2: Fix Blank Blockquote Lines with CR
            // Fixes blank "> " lines with \r line endings anywhere inside a blockquote.
            // Ensures that content following such lines remains part of the quote by
            // prepending "> ", preserving proper Markdown blockquote structure.
            /^> \r/gm,
            "> \n> "
        );
}
