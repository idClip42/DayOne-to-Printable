import { getImageFilePath } from "../images";
import { getAttachmentMarkdown } from "../attachments/textProcess";
import { DayOneEntry } from "../../../../../types/DayOneEntry";
import { getAttachmentInfo } from "../attachments/info";
import { marked } from "marked";
import { renderTemplate } from "../../../../../utilities/template";
import { SingleNewlineParagraphTemplateVars } from "../../../../../templates/singleNewlineParagraph.hbs";

const SINGLE_NEWLINE_TEMPLATE_PATH = "src/templates/singleNewlineParagraph.hbs";

// TODO: 1. Design cumulative test for all rules that shows all rules working.
// TODO: 2. Break rules into category files, and validate against test file.
// TODO: 3. Refine rules.

export function processText(inputText: string, entry: DayOneEntry): string {
    return inputText
        .replace(
            // #: 1
            // NAME: Header Line Isolation
            // CATEGORY: Structural Markdown Guards
            // PURPOSE: Guarantees headers terminate cleanly and do not “leak” formatting into body text.
            // DEPENDS ON: Raw Markdown still intact (should be very early)
            // CONFLICTS: None directly. Later newline-collapsing rules could negate this if reordered.
            // WARNINGS: None.
            //
            // Add an extra return after every header line of any level.
            // This makes absolutely sure that no body text is also formatted
            // like a header.
            // TODO: We should probably enforce always having two newlines, instead of arbitrarily adding one.
            /(^#{1,}.*\n)/gm,
            match => match + "\n"
        )
        .replace(
            // #: 2
            // NAME: Fix Blank Blockquote Lines with CR
            // CATEGORY: Blockquote Integrity
            // PURPOSE: Repairs malformed empty quote lines so subsequent content remains quoted.
            // DEPENDS ON: Raw blockquote syntax preserved
            // CONFLICTS: Later <br> manipulation inside quotes. Quote normalization rules near the end.
            // WARNINGS: This rule is extremely specific; it probably belongs in a “DayOne CRLF anomalies” subgroup.
            //
            // Fixes blank "> " lines with \r line endings anywhere inside a blockquote.
            // Ensures that content following such lines remains part of the quote by
            // prepending "> ", preserving proper Markdown blockquote structure.
            /^> \r/gm,
            "> \n> "
        )
        .replace(
            // #: 3
            // NAME: Blockquote Termination Guard
            // CATEGORY: Blockquote Integrity
            // PURPOSE: Ensures content following a blockquote doesn’t accidentally merge into it.
            // DEPENDS ON: Blockquotes still being line-based (> intact)
            // CONFLICTS: Can be partially undone by later quote <br> cleanup. Can be affected by newline normalization rules.
            // WARNINGS: This rule is defensive but broad — it operates across quote boundaries and paragraph boundaries.
            //
            // Add extra newlines at end of ">" block quotes.
            // This makes sure commentary after block quotes
            // (without an extra newline to separate it out)
            // doesn't get merged in with the block quotes.
            />[^>].*\n(?!>)/g,
            match => match + "\n"
        )
        .replace(
            // #: 4
            // NAME: List Item / Paragraph Boundary Guard
            // CATEGORY: List Integrity
            // PURPOSE: Prevents a paragraph following a list item from being parsed as part of that item.
            // DEPENDS ON: List syntax still raw. No <br> inserted yet.
            // CONFLICTS: This rule must run before any newline-to-<br> logic.
            // WARNINGS: None.
            //
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
            // #: 5
            // NAME: Single-Newline → <br> Conversion
            // CATEGORY: Line-break Normalization
            // PURPOSE: Turns “soft” line breaks into semantic <br> without breaking MD structures.
            // DEPENDS ON: Structural guards (lists, quotes, headers) already reinforced
            // CONFLICTS: Quote <br> cleanup at the end. Code block normalization (later replaces <br> back to \n). Single-newline paragraph wrapper (next rule).
            // WARNINGS: his is a keystone rule — many later rules exist specifically to clean up its side effects.
            //
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
            // #: 6
            // NAME: Single-Newline Paragraph Wrapper
            // CATEGORY: Line-break Normalization / HTML Injection
            // PURPOSE: Elevates single-newline paragraphs into a semantic structure distinguishable in HTML.
            // DEPENDS ON: Rule 5 having already replaced newlines with <br>. No lists / quotes inside content.
            // CONFLICTS: Recursively calls processText (⚠️ huge coupling). Quote <br> cleanup explicitly undoes parts of this later. Code cleanup removes <br>.
            // WARNINGS: This rule is doing: Markdown parsing; HTML parsing assumptions; Recursive text processing; Rendering concerns; It’s the emotional core of your pipeline — powerful, but dangerous.
            //
            // Now that we know `<br>` marks all of our single-newline paragraph breaks,
            // we can replace that with a full-on `<p>` element with a special class.
            // We'll use this to structurally distinguish these single-newline paragraphs
            // without them looking any different visually.
            // NOTE: I'm pretty sure this won't affect quote blocks or lists.
            /<br>([\s\S]*?)(?=<br>|\n|$)/g,
            (_, content) => {
                // We know that `content.trim()` is a
                // single line of text.
                // Whatever it may have in it, it has
                // no new lines. Everything is
                // self-contained...

                // ...Which means we can safely process
                // that line before parsing it.
                // Get rid of any stray backslashes in
                // code backticks and whatnot.
                const processedContent = processText(content.trim(), entry);

                // If we drop the content straight in,
                // it'll be left as raw markdown in an
                // HTML element, so we have to parse it.
                const parsedContent = marked.parse(processedContent, {
                    async: false,
                });
                // But if we drop the `<p>` element it
                // produces in our template, it doesn't
                // work for some reason - creates a
                // separate paragraph.

                // We know (or rather, assume) that a
                // simple line of text, when passed
                // through the parser, will produce a
                // `<p>` paragraph...
                const TAG_START = "<p>";
                const TAG_END = "</p>\n";
                if (
                    !parsedContent.startsWith(TAG_START) ||
                    !parsedContent.endsWith(TAG_END)
                ) {
                    throw new Error(
                        `Unhandled single-newline paragraph md => html: \n${JSON.stringify(parsedContent)}`
                    );
                }

                // ...so we steal the HTML content of the
                // `<p>` from out of the tags...
                const clippedContent = parsedContent.substring(
                    TAG_START.length,
                    parsedContent.length - TAG_END.length
                );

                // ...and we pass it into our waiting template.
                const html = renderTemplate<SingleNewlineParagraphTemplateVars>(
                    SINGLE_NEWLINE_TEMPLATE_PATH,
                    {
                        htmlContent: clippedContent,
                    }
                );

                // Putting a space between the newlines is a hack fix.
                // When I put them together, some other rule gets rid
                // of one of them and then the bullets that follow don't
                // convert to HTML properly.
                return `\n \n${html}\n \n`;
            }
        )
        .replace(
            // #: 7
            // NAME: Unicode Line Separator Normalization
            // CATEGORY: Line-break Normalization
            // PURPOSE: Normalizes weird DayOne line separators into expected breaks.
            // DEPENDS ON: Structural guards (lists, quotes, headers) already reinforced
            // CONFLICTS: Quote cleanup. Code block cleanup.
            // WARNINGS: This belongs with Rule 5 logically, even if execution order stays separate.
            //
            // U+2028 appears to be an unusual line separator that is showing up in my stuff sometimes.
            // Replace it with a <br>.
            // One example of a place this shows up is in single-newlines in bullets that are meant to
            // stay within those bullets.
            // Also spotting it:
            // - On normal text after a quote block
            // - On normal text after normal text
            // - Mid-quote block
            // So these just pop up randomly every so often, and their context is inconsistent.
            // I count 103 in volume 2 alone.
            // So I guess they just have to be acceptable losses?
            //
            // TODO: Maybe we need to flag specifically when this shows up mid-bullet.
            // TODO: Make it a <br> mid-bullet, make it a \n otherwise (before any other processing)?
            // TODO: Investigate its use at the end of a blockquote in January 1 "Mackenzie and Fireworks"
            // TODO: (vs. mid-blockquote in Jan 4 "Morning" -  Would this case be fine if we just made it \n?).
            // TODO: Investigate its use AFTER two bulleted lists end (correctly) in January 14 "The multiverse".
            // TODO: Investigate its use after a clear paragraph break in February 12 "Just watched some Game Maker’s Toolkit videos". (Would this case be fine if we just made it \n?)
            // TODO: Investigate its double-use in February 18, "Mackenzie is asking if I’m gonna respond". (Would this case be fine if we just made it \n?)
            //
            // How the robot is wording it:
            //
            // TEMPORARY: U+2028 normalization
            // --------------------------------
            // DayOne uses U+2028 inconsistently.
            // If normalized earlier, it is captured by the single-newline
            // paragraph promotion logic and produces incorrect structure.
            //
            // This MUST run *after* paragraph wrapping, even though it
            // logically belongs in input sanitization.
            //
            // Revisit once U+2028 semantics are fully understood.
            /\u2028/g,
            "<br>"
        )
        .replace(
            // #: 8
            // NAME: Preserve Line Breaks Within Blockquotes
            // CATEGORY: Blockquote Integrity
            // PURPOSE: Allows multi-line quotes to preserve internal breaks without ending the quote.
            // DEPENDS ON: <br> already being semantic. Quote markers intact.
            // CONFLICTS: Explicitly undone later by quote <br> cleanup rules.
            // WARNINGS: This is a “temporary corruption” rule — it knowingly introduces garbage that must be cleaned later.
            //
            // Insert <br> before a new blockquote line ("> ") *only if* the previous line also starts with "> ".
            // This helps preserve line breaks within quoted blocks without affecting quote boundaries.
            /(?<=^>.*)\n(?=> )/gm,
            "<br>\n"
        )
        .replace(
            // #: 9
            // NAME: Ensure Spacing Before Images
            // CATEGORY: Image & Attachment Normalization
            // PURPOSE: Ensures images don’t get glued to preceding text.
            // DEPENDS ON: Images still in markdown form
            // CONFLICTS: List/image fix rule later. Newline collapsing rules.
            // WARNINGS: None.
            //
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
            // #: 10
            // NAME: Ensure Spacing After Images
            // CATEGORY: Image & Attachment Normalization
            // PURPOSE: Symmetric with Rule 9 — isolates images visually and structurally.
            // DEPENDS ON: Images still in markdown form
            // CONFLICTS: List/image fix rule
            // WARNINGS: None
            //
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
            // #: 11
            // NAME: Inline Images Inside Lists Fix
            // CATEGORY: List Integrity / Image Normalization
            // PURPOSE: Prevents image spacing rules from breaking list nesting.
            // DEPENDS ON: Rules 9 & 10 having already added spacing
            // CONFLICTS: Future newline normalization
            // WARNINGS: This rule is a patch for Rules 9 & 10 — they should be grouped together.
            //
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
            // #: 12
            // NAME: Resolve DayOne Image Attachments
            // CATEGORY: Image & Attachment Normalization
            // PURPOSE: Replaces DayOne pseudo-URLs with real image paths or fallback attachments.
            // DEPENDS ON: Entry metadata available. Before code/image spacing rules ideally.
            // CONFLICTS: None.
            // WARNINGS: None.
            //
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
            // #: 13
            // NAME: Remove Empty Fenced Code Blocks
            // CATEGORY: Code Normalization
            // PURPOSE: Rejoins DayOne’s fragmented code blocks.
            // DEPENDS ON: Raw code fences intact
            // CONFLICTS: None.
            // WARNINGS: None.
            //
            // For some reason, DayOne separates each code block line
            // into separate blocks with separate triple-backticks.
            // So this re-merges them.
            /```[\n\r]+```/g,
            ""
        )
        .replace(
            // #: 14
            // NAME: Normalize Code Block Content
            // CATEGORY: Code Normalization
            // PURPOSE:Remove stray backslashes; Convert <br> back to \n; Collapse excessive newlines
            // DEPENDS ON: Rule 5 having possibly introduced <br>. Must run after single-newline logic.
            // CONFLICTS: Inline code cleanup later might diverge logic. Backslash cleanup elsewhere.
            // WARNINGS: None.
            //
            // In code blocks:
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
            // #: 15
            // NAME: Unicode Bullet Normalization
            // CATEGORY: List Integrity
            // PURPOSE: Turns copy-pasted bullets into real Markdown lists.
            // DEPENDS ON: Before list spacing rules ideally
            // CONFLICTS: None
            // WARNINGS: None
            //
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
            // #: 16
            // NAME: Collapse Excess Newlines Before Lists
            // CATEGORY: List Integrity / Line-break Normalization
            // PURPOSE: Prevents list parsing issues due to excessive vertical whitespace.
            // DEPENDS ON: After paragraph / image spacing rules
            // CONFLICTS: Header spacing. Image spacing.
            // WARNINGS: None.
            //
            // If there are multiple newlines before a line that looks like `[-] stuff`,
            // // then replace the extra newlines (just the extras!) with `<br>` —
            // // but leave the final newline intact, so that the list item still starts on its own line.
            // // (The extra `<br>` is because the formatting seems to ignore the first one.)
            // Actually let's just get rid of the extra newlines altogether.
            /\n{2,}(?=\s*- )/g,
            // match => "<br>".repeat(match.length - 1) + "<br>\n"
            match => "\n"
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
        )
        .replace(
            // #: 19
            // NAME: Flatten Nested Blockquotes
            // CATEGORY: Blockquote Integrity
            // PURPOSE: Disallows multi-tier quote nesting.
            // DEPENDS ON: Raw quotes still intact
            // CONFLICTS: Earlier quote-specific formatting rules
            // WARNINGS: None
            //
            // No multi-tiered quote blocks.
            // They don't show up in the journal, so they shouldn't show up here.
            /^(\s*>){2,}\s?/gm,
            "> "
        )
        .replace(
            // #: 20
            // NAME: URL Backslash Cleanup
            // CATEGORY: Escape / Backslash Cleanup
            // PURPOSE: Removes stray escapes from URLs.
            // DEPENDS ON: URLs not yet parsed to HTML
            // CONFLICTS: Code block cleanup if misordered
            // WARNINGS: None
            //
            // Get rid of stray backslashes in URLs.
            // Backslashes at this point are unprocessed markdown, and we can kill
            // all of them unless they're escaping another backslash.
            /(https?:\/\/.*)$/gm,
            line => line.replace(/\\([^\\])/g, "$1")
        )
        .replace(
            // #: 21
            // NAME: Quote Line Backslash Cleanup
            // CATEGORY: Escape / Backslash Cleanup
            // PURPOSE: Same as Rule 20, but scoped to quotes
            // DEPENDS ON: Quote structure intact
            // CONFLICTS: None
            // WARNINGS: None
            //
            // Get rid of stray backslashes in quote blocks.
            // Backslashes at this point are unprocessed markdown, and we can kill
            // all of them unless they're escaping another backslash.
            /^>\s*.*$/gm,
            line => line.replace(/\\([^\\])/g, "$1")
        )
        .replace(
            // #: 22
            // NAME: Inline Code Backslash Cleanup
            // CATEGORY: Escape / Backslash Cleanup
            // PURPOSE: Normalizes escaped characters in inline code.
            // DEPENDS ON: Before code block normalization ideally
            // CONFLICTS: None
            // WARNINGS: None
            //
            // Get rid of stray backslashes in single-line code.
            // (We'll probably need to do this with code-blocks eventually too.)
            // Backslashes at this point are unprocessed markdown, and we can kill
            // all of them unless they're escaping another backslash.
            /`([^`\n]+)`/g,
            (_, code) => `\`${code.replace(/\\([^\\])/g, "$1")}\``
        )
        .replace(
            // #: 23
            // NAME: Horizontal Rule / Image Separation
            // CATEGORY: Horizontal Rule Fixups
            // PURPOSE:
            // DEPENDS ON:
            // CONFLICTS:
            // WARNINGS:
            //
            // For some reason, I've got "---" horizontal rules with images
            // on the same line.
            // This adds a couple line breaks so that the horizontal rule
            // renders correctly.
            /---\s+!/g,
            "---\n\n!"
        )
        .replace(
            // #: 24
            // NAME: Horizontal Rules Inside Quotes
            // CATEGORY: Horizontal Rule Fixups / Blockquote Integrity
            // PURPOSE:
            // DEPENDS ON:
            // CONFLICTS:
            // WARNINGS:
            //
            // Some horizontal rules are in quote blocks. This fixes those entirely.
            /> ---/g,
            "> <hr>"
        )
        .replace(
            // #: 25
            // NAME: Escaped Horizontal Rule Cleanup
            // CATEGORY: Horizontal Rule Fixups
            // PURPOSE:
            // DEPENDS ON:
            // CONFLICTS:
            // WARNINGS:
            //
            // Apparently we've got some "\-\-\-" in there too.
            /\\-\\-\\-/g,
            "---"
        )
        .replace(
            // #: 26
            // NAME: Quote <br> Cleanup – Phase 1
            // CATEGORY: Blockquote Integrity / Line-break Normalization
            // PURPOSE: Removes unwanted <br> pollution inside quotes.
            // DEPENDS ON: Rule 8 having added them
            // CONFLICTS: Explicitly undoes earlier rules.
            // WARNINGS: Explicitly undoes earlier rules.
            //
            // But we need to fix our quote blocks, which are filled with <br>s
            // and we don't want them to be.
            // We want to leave only the <br>s that indicate a single-newline
            // paragraph break.
            //
            // (We're probably undoing an earlier rule at this point.)
            //
            // 1. Remove <br> from content lines ONLY when followed by an empty quote line
            /^(>.*)<br>\n(?=>\s*<br>\n)/gm,
            "$1\n"
        )
        .replace(
            // #: 27
            // NAME: Quote <br> Cleanup – Phase 2
            // CATEGORY: Blockquote Integrity
            // PURPOSE: Normalizes empty quote lines.
            // DEPENDS ON:
            // CONFLICTS:
            // WARNINGS:
            //
            // 2. Normalize empty quote lines
            /^>\s*<br>\n/gm,
            "> \n"
        );
}
