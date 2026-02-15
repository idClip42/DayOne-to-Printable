import REPLACERS from "./../../../../../../../htmlReplacers.json";

export function fixLists(input: string): string {
    return input
        .replace(
            // Match an empty line (\n or \r\n) that is between two markdown bullets.
            // Put a temporary element between them, which we'll hide later.
            // Otherwise, the gap breaks the whole list.
            /(^[ \t]*[-*+]\s.*\r?\n)(\r?\n)(?=[ \t]*[-*+]\s)/gm,
            `$1\n${REPLACERS.midListBreak.tag}\n`
        )
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
        )
        .replace(
            // Replace all *carriage return characters* (\r) that occur within an unordered list item line
            // (lines that start with optional indent + (*|-|+) + space).
            /^([ \t]*[*+-] [^\n]*)$/gm,
            line => line.replace(/\r/g, /* "[[BACKSLASH_R_BR]]" + */ "<br>")
        );
}
