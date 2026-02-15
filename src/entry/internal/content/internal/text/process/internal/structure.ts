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

    // TODO: Confirm we don't need these rules.
    // .replace(
    //     // 9: Ensure Spacing Before Images
    //     // Ensure at least two newlines before an image — but only if there’s real content above.
    //     /([^\n\s][^\n]*?)\n([ \t]*!?\[.*?\]\(.*?\))/g,
    //     (_, before, image) => `${before}\n\n${image}`
    // )
    // .replace(
    //     // 10: Ensure Spacing After Images
    //     // Ensure at least two newlines after an image — but only if there’s real content below.
    //     /(!?\[.*?\]\(.*?\))\n(?=\S)/g,
    //     (_, image) => `${image}\n\n`
    // )
    // .replace(
    //     // 23: Horizontal Rule / Image Separation
    //     // For some reason, I've got "---" horizontal rules with images
    //     // on the same line.
    //     // This adds a couple line breaks so that the horizontal rule
    //     // renders correctly.
    //     /---\s+!/g,
    //     "---\n\n!"
    // );
}
