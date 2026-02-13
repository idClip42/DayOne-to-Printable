export function fixLists(input: string): string {
    // TODO: Line breaks internal to list items happen
    // TODO: via a "\r".
    // TODO: So we need to find all "\r"s in list items
    // TODO: and replace them with <br>s.
    return input
        .replace(
            // 16.1: All lists must have two newlines before them.
            /(^|\n)([^\n]*?)\n+(?=^[ \t]*[-*] )/gm,
            (match, prefix, line, offset, full) => {
                if (offset === 0) return match;

                if (/^[ \t]*[-*] /.test(line)) {
                    // previous line is list item → inside list
                    return match;
                }

                return prefix + line + "\n\n";
            }
        )
        .replace(
            // 11: Inline Images Inside Lists Fix
            // All images are surrounded by "\n\n" double newlines.
            // When an image is inserted mid-list,
            // at one of the nested levels instead of the top level,
            // this line break breaks the list entirely.
            // We fix this by:
            // - Finding images that come after list items
            // - Removing both line breaks from the start
            // - Removing one of the two line breaks from the finish.
            /(\n[ \t]*[-*][^\n]*)(\n\n)!?\[\]\((.*?)\)\n\n/g,
            (_, bulletLine, _gap, url) => `${bulletLine} ![](${url})\n`
        );
}
