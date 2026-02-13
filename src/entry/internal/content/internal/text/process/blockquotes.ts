export function fixBlockquotes(input: string): string {
    return input
        .replace(
            // TODO: This doesn't fix everything.
            // TODO: This isn't anywhere near working.
            /(^>[^\S\r\n]*\n)\s*(?=[^>\s])/gm,
            "$1> "
        )
        .replace(
            // 19: Flatten Nested Blockquotes
            // No multi-tiered quote blocks.
            // They don't show up in the journal, so they shouldn't show up here.
            /^(\s*>){2,}\s?/gm,
            "> "
        )
        .replace(
            // 24: Horizontal Rules Inside Quotes
            // Some horizontal rules are in quote blocks. This fixes those entirely.
            /> ---/g,
            "> <hr>"
        );
}
