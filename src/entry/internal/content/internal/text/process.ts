import { getImageFilePath } from "../images";
import { getAttachmentMarkdown } from "../attachments/textProcess";
import { DayOneEntry } from "../../../../../types/DayOneEntry";
import { getAttachmentInfo } from "../attachments/info";
import REPLACERS from "./../../../../../htmlReplacers.json";

const U_2028_TAG = "[[U_2028]]";

// TODO: 1. Design cumulative test for all rules that shows all rules working.
// TODO: 2. Break rules into category files, and validate against test file.
// TODO: 3. Refine rules.

export function processText(inputText: string, entry: DayOneEntry): string {
    return inputText

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
        )
        .replace(
            // 7.1: Unicode Line Separator Normalization
            // U+2028 appears to be an unusual newline that is showing up in my stuff sometimes.
            // This is the quote block version.
            /(^>.*)\u2028/gm,
            "$1\n> "
        )
        .replace(
            // 7.2: Unicode Line Separator Normalization
            // U+2028 appears to be an unusual newline that is showing up in my stuff sometimes.
            // This is the regular version.
            /\u2028/g,
            `\n`
        )

        .replace(
            // 1.1: Header Line Isolation
            // Enforces exactly two newlines after every header.
            /^(#{1,6}.*)\n+/gm,
            "$1\n\n"
        )
        .replace(
            // 3: Blockquote Termination Guard
            // Add extra newlines at end of ">" block quotes.
            />[^>].*\n(?!>)/g,
            match => match + "\n"
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
        )
        .replace(
            // 9: Ensure Spacing Before Images
            // Ensure at least two newlines before an image — but only if there’s real content above.
            /([^\n\s][^\n]*?)\n([ \t]*!?\[.*?\]\(.*?\))/g,
            (_, before, image) => `${before}\n\n${image}`
        )
        .replace(
            // 10: Ensure Spacing After Images
            // Ensure at least two newlines after an image — but only if there’s real content below.
            /(!?\[.*?\]\(.*?\))\n(?=\S)/g,
            (_, image) => `${image}\n\n`
        )
        .replace(
            // 23: Horizontal Rule / Image Separation
            // For some reason, I've got "---" horizontal rules with images
            // on the same line.
            // This adds a couple line breaks so that the horizontal rule
            // renders correctly.
            /---\s+!/g,
            "---\n\n!"
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
        )

        .replace(
            // 12: Resolve DayOne Image Attachments
            // Replaces all DayOne image links with the link
            // to the actual relevant image.
            /!\[]\(dayone-moment:(.*?)\)/g,
            (_, match) => {
                const attachmentInfo = getAttachmentInfo(entry, match);
                if (attachmentInfo.type === "Photo") {
                    const imageFilePath = getImageFilePath(
                        entry,
                        match.replace("//", "")
                    );
                    if (imageFilePath) return `![](${imageFilePath})`;
                }

                // If it's not an image, or we couldn't find the image,
                // default to this.
                return getAttachmentMarkdown(attachmentInfo);
            }
        )

        .replace(
            // 13: Remove Empty Fenced Code Blocks
            // PURPOSE: Rejoins DayOne’s fragmented code blocks.
            // For some reason, DayOne separates each code block line
            // into separate blocks with separate triple-backticks.
            // So this re-merges them.
            /```[\n\r]+```/g,
            ""
        )
        .replace(
            // 14: Normalize Code Block Content
            // CATEGORY: Code Normalization
            // PURPOSE:Remove stray backslashes; ~~Convert <br> back to \n;~~ Collapse excessive newlines
            // In code blocks:
            // This removes backslashes,
            // puts back single quotes,
            // and replaces anything more than
            // two newlines with just two newlines.
            /```([\s\S]*?)```/g,
            (match, codeBlock) => {
                const normalized = codeBlock
                    .replace(/\\/g, "")
                    // .replace(/<br>/g, "\n")
                    .replace(/\n{2,}/g, "\n\n");
                const final = `\`\`\`${normalized}\`\`\``;
                return final;
            }
        )

        .replace(
            // 20: URL Backslash Cleanup
            // Backslashes at this point are unprocessed markdown, and we can kill
            // all of them unless they're escaping another backslash.
            /(https?:\/\/.*)$/gm,
            line => line.replace(/\\([^\\])/g, "$1")
        )
        .replace(
            // 21: Quote Line Backslash Cleanup
            // Backslashes at this point are unprocessed markdown, and we can kill
            // all of them unless they're escaping another backslash.
            /^>\s*.*$/gm,
            line => line.replace(/\\([^\\])/g, "$1")
        )
        .replace(
            // 22: Inline Code Backslash Cleanup
            // Get rid of stray backslashes in single-line code.
            // (We'll probably need to do this with code-blocks eventually too.)
            // Backslashes at this point are unprocessed markdown, and we can kill
            // all of them unless they're escaping another backslash.
            /`([^`\n]+)`/g,
            (_, code) => `\`${code.replace(/\\([^\\])/g, "$1")}\``
        )

        .replace(
            // 5: Single-Newline Conversion
            // Replace single `\n` (not followed by a list item, blockquote, or table line).
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
            `\n\n${REPLACERS.singleNewlineParagraph.tag}`
        )

        .replace(
            // #: 17
            // NAME: Bold Highlight Conversion
            // CATEGORY: Highlight & Formatting Extensions
            // PURPOSE: Preserves DayOne highlight syntax inside bold text.
            // DEPENDS ON: Must run before plain highlight rule
            // CONFLICTS: None if ordered correctly
            // WARNINGS: None.
            //
            // Convert "**==highlighted text==**" into HTML bold + highlight.
            // Some exported Markdown uses "==text==" to indicate highlights, but this syntax
            // isn't supported by all Markdown parsers. To preserve formatting in HTML,
            // we convert these to <strong><mark>text</mark></strong>.
            //
            // TODO: This is actually a use case for pre-parsing the interior markdown.
            // TODO: And because it can happen right at the end, we don't have to worry
            // TODO: about running `process.ts` in a nested way.
            /\*\*==(.+?)==\*\*/g,
            "<strong><mark>$1</mark></strong>"
        )
        .replace(
            // #: 18
            // NAME: Plain Highlight Conversion
            // CATEGORY: Highlight & Formatting Extensions
            // PURPOSE: Extends Markdown with highlight support.
            // DEPENDS ON: After Rule 17
            // CONFLICTS: None.
            // WARNINGS: None.
            //
            // Convert "==highlighted text==" into HTML <mark> tags.
            // This handles highlight syntax not supported by standard Markdown.
            // Run this *after* the bold-highlight rule to avoid nested replacements.
            /==(.+?)==/g,
            "<mark>$1</mark>"
        );
}
