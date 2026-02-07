export function PreprocessText(inputText: string): string {
    // Trim leading/trailing whitespace.
    const trimmed = inputText.trim();
    // Find first line break.
    const firstNewlineIndex = trimmed.indexOf("\n");
    const firstLine =
        firstNewlineIndex === -1
            ? trimmed
            : trimmed.slice(0, firstNewlineIndex);
    // If the first line doesn't start with a markdown header,
    // and also it doesn't start with a list item hyphen (so it's not a list item),
    // and it's short enough to be a reasonable header,
    // prepend "# ".
    if (
        !firstLine.startsWith("#") &&
        !firstLine.startsWith("-") &&
        firstLine.length <= 100
    ) {
        return `# ${firstLine}\n\n${trimmed.slice(firstNewlineIndex)}`;
    }
    // Otherwise, just return it as is.
    return trimmed;
}
