import { GetImageFilePath } from "../images";
import {
    GetAttachmentMarkdown,
    GetAttachmentText,
} from "../attachments/textProcess";
import { DayOneEntry } from "../../../../../types/DayOneEntry";
import { GetAttachmentInfo } from "../attachments/info";

export function ProcessText(inputText: string, entry: DayOneEntry): string {
    return inputText
        .replace(
            // Add an extra return after every header line of any level.
            // This makes absolutely sure that no body text is also formatted
            // like a header.
            /(^#{1,}.*\n)/gm,
            match => match + "\n"
        )
        .replace(
            // Fixes blank "> " lines with \r line endings anywhere inside a blockquote.
            // Ensures that content following such lines remains part of the quote by
            // prepending "> ", preserving proper Markdown blockquote structure.
            /^> \r/gm,
            "> \n> "
        )
        .replace(
            // Add extra newlines at end of ">" block quotes.
            // This makes sure commentary after block quotes
            // (without an extra newline to separate it out)
            // doesn't get merged in with the block quotes.
            />[^>].*\n(?!>)/g,
            match => match + "\n"
        )
        .replace(
            // Insert an extra newline after list items when the next line starts with text.
            // This ensures that any paragraph-like content following a list item is not treated
            // as part of the same list item by Markdown parsers.
            /*
                Breakdown of the pattern:
                - `(?<=^[-*+] .+)` — Positive lookbehind:
                    - Ensures the preceding line starts with a list item (`-`, `*`, or `+` followed by a space),
                    and has at least one character after the marker.
                - `\n` — Matches the single newline after that list item.
                - `(?=[^\s\-*+>\d])` — Positive lookahead:
                    - Ensures the next line starts with a non-whitespace character
                    that is NOT another list marker (`-`, `*`, `+`), a blockquote (`>`), or a number (like `1.`).
                    - In other words, the line begins with a plain text character.
                - `gm` flags:
                    - `g` (global): apply the replacement throughout the string.
                    - `m` (multiline): so `^` and `$` apply to each line, not just the whole string.
            */
            /(?<=^[-*+] .+)\n(?=[^\s\-*+>\d])/gm,
            "\n\n"
        )
        .replace(
            // Replace single `\n` (not followed by a list item, blockquote, or table line) with <br>.
            // This converts paragraph-style line breaks to <br> without affecting Markdown structures.
            /*
                Breakdown:
                - `(?<!\n)` — Not preceded by another newline (we're not in a blank line).
                - `\n` — The newline we might want to replace.
                - `(?!\n)` — Not followed by another newline (avoiding paragraph breaks).
                - `(?= *(?![*\-+>|] |\d+\. )` — Lookahead ensures:
                    - Optional leading spaces
                    - NOT:
                        - a bullet list item (*, -, + followed by space)
                        - a blockquote (`> `)
                        - a numbered list (`1. `)
                        - a table row (starting with `|`)
                        - a table alignment row (like `|:---|:---|`)
                    - `\S` — Next character must be non-whitespace
            */
            /(?<!\n)\n(?!\n)(?= *(?![*\-+>|] |\d+\. |\||[:|\- ]+\|)\S)/g,
            "<br>"
        )
        .replace(
            // Insert <br> before a new blockquote line ("> ") *only if* the previous line also starts with "> ".
            // This helps preserve line breaks within quoted blocks without affecting quote boundaries.
            /(?<=^>.*)\n(?=> )/gm,
            "<br>\n"
        )
        .replace(
            // U+2028 appears to be an unusual line separator that is showing up in my stuff sometimes.
            // Replace it with a <br>.
            /\u2028/g,
            "<br>"
        )
        .replace(
            // Ensure at least two newlines before an image — but only if there’s real content above.
            /*
                Matches:
                - Any non-whitespace, non-newline content ending in a single `\n` (group 1)
                - Followed by an optional space and an image tag (group 2)
                - Only if it's not already preceded by two `\n` or at the very start
    
                We replace the single `\n` with `\n\n` to ensure a proper paragraph break.
            */
            /([^\n\s][^\n]*?)\n([ \t]*!?\[.*?\]\(.*?\))/g,
            (_, before, image) => {
                // console.log("before");
                // console.log(_);
                return `${before}\n\n${image}`;
            }
        )
        .replace(
            // Ensure at least two newlines after an image — but only if there’s real content below.
            /*
                Matches:
                - An image tag followed by a single `\n` (group 1)
                - Only if what follows is a line that starts with a non-whitespace character (group 2)
                - This implies it's not the end, and we want the image to be more cleanly separated.
    
                We replace the single newline with a double.
            */
            /(!?\[.*?\]\(.*?\))\n(?=\S)/g,
            (_, image) => {
                // console.log("after");
                // console.log(_);
                return `${image}\n\n`;
            }
        )
        .replace(
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
            // Replaces all DayOne image links with the link
            // to the actual relevant image.
            /!\[]\(dayone-moment:(.*?)\)/g,
            (_, match) => {
                const attachmentInfo = GetAttachmentInfo(entry, match);
                if (attachmentInfo.type === "Photo") {
                    const imageFilePath = GetImageFilePath(
                        entry,
                        match.replace("//", "")
                    );
                    if (imageFilePath) return `![](${imageFilePath})`;
                }

                // If it's not an image, or we couldn't find the image,
                // default to this.
                return GetAttachmentMarkdown(GetAttachmentText(attachmentInfo));
            }
        )
        .replace(
            // For some reason, DayOne separates each code block line
            // into separate blocks with separate triple-backticks.
            // So this re-merges them.
            /```[\n\r]+```/g,
            ""
        )
        .replace(
            // This removes backslashes,
            // puts back single quotes,
            // and replaces anything more than
            // two newlines with just two newlines.
            /```([\s\S]*?)```/g,
            (match, codeBlock) => {
                const normalized = codeBlock
                    .replace(/\\/g, "")
                    .replace(/<br>/g, "\n")
                    .replace(/\n{2,}/g, "\n\n");
                const final = `\`\`\`${normalized}\`\`\``;
                return final;
            }
        )
        .replace(
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
            //If there are multiple newlines before a line that looks like `[-] stuff`,
            // // then replace the extra newlines (just the extras!) with `<br>` —
            // // but leave the final newline intact, so that the list item still starts on its own line.
            // // (The extra `<br>` is because the formatting seems to ignore the first one.)
            // Actually let's just get rid of the extra newlines altogether.
            /\n{2,}(?=\s*- )/g,
            // match => "<br>".repeat(match.length - 1) + "<br>\n"
            match => "\n"
        )
        .replace(
            // Convert "**==highlighted text==**" into HTML bold + highlight.
            // Some exported Markdown uses "==text==" to indicate highlights, but this syntax
            // isn't supported by all Markdown parsers. To preserve formatting in HTML,
            // we convert these to <strong><mark>text</mark></strong>.
            /\*\*==(.+?)==\*\*/g,
            "<strong><mark>$1</mark></strong>"
        )
        .replace(
            // Convert "==highlighted text==" into HTML <mark> tags.
            // This handles highlight syntax not supported by standard Markdown.
            // Run this *after* the bold-highlight rule to avoid nested replacements.
            /==(.+?)==/g,
            "<mark>$1</mark>"
        )
        .replace(
            // No multi-tiered quote blocks.
            // They don't show up in the journal, so they shouldn't show up here.
            /^(\s*>){2,}\s?/gm,
            "> "
        )
        .replace(
            // Get rid of stray backslashes around punctuation in URLs.
            /(https?:\/\/.*)$/gm,
            line => line.replace(/\\([\\() .\-_:/?=&%#])/g, "$1")
        )
        .replace(
            // Get rid of stray backslashes around punctuation in quote blocks.
            /^>\s*.*$/gm,
            line => line.replace(/\\([().\-.,:;!?*])/g, "$1")
        )
        .replace(
            // For some reason, I've got "---" horizontal rules with images
            // on the same line.
            // This adds a couple line breaks so that the horizontal rule
            // renders correctly.
            /---\s+!/g,
            "---\n\n!"
        )
        .replace(
            // Some horizontal rules are in quote blocks. This fixes those entirely.
            /> ---/g,
            "> <hr>"
        )
        .replace(
            // Apparently we've got some "\-\-\-" in there too.
            /\\-\\-\\-/g,
            "---"
        );
}
