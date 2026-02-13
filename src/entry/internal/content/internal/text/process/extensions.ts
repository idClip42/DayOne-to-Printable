export function handleExtensions(input: string): string {
    return input
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
            // TODO: I think we need to figure out something clever here to make this reasonable.
            // TODO: We can't do the tag thing because we can't guarantee this is the start of an element,
            // TODO: and it could be in any...
            // TODO: ...unless we abuse an existing MD element type?
            /==(.+?)==/g,
            "<mark>$1</mark>"
        );
}
