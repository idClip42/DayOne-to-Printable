const REGEX_HEADER = /^(#{1,6}.*)\n+/gm;
const REGEX_LIST_NEWLINE = /(?<=^[-*+] .+)\n(?=[^\s\-*+>\d])/gm;
const REGEX_BULLET_SPACES = /^([ \t]*)([-*])[ \t]{2,}/gm;

export function cleanStructure(input: string): string {
    return input
        .replace(
            // 1.1: Header Line Isolation
            // Enforces exactly two newlines after every header.
            REGEX_HEADER,
            "$1\n\n"
        )
        .replace(
            // 4: List Item / Paragraph Boundary Guard
            // Insert an extra newline after list items when the next line starts with text.
            REGEX_LIST_NEWLINE,
            "\n\n"
        )
        .replace(
            // NEW: Replace multiple spaces between bullet and text with one space.
            REGEX_BULLET_SPACES,
            "$1$2 "
        );
}
