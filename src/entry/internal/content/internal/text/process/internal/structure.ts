export function cleanStructure(input: string): string {
    return input
        .replace(
            // 1.1: Header Line Isolation
            // Enforces exactly two newlines after every header.
            /^(#{1,6}.*)\n+/gm,
            "$1\n\n"
        )
        .replace(
            // 4: List Item / Paragraph Boundary Guard
            // Insert an extra newline after list items when the next line starts with text.
            /(?<=^[-*+] .+)\n(?=[^\s\-*+>\d])/gm,
            "\n\n"
        )
        .replace(
            // NEW: Replace multiple spaces between bullet and text with one space.
            /^([ \t]*)([-*])[ \t]{2,}/gm,
            "$1$2 "
        );
}
