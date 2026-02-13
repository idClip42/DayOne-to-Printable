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
        );
}
