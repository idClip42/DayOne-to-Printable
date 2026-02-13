export function fixCode(input: string): string {
    // TODO: Find examples of code blocks in the journal
    // TODO: and make tests for them.
    return input
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
            // PURPOSE:Remove stray backslashes; Collapse excessive newlines
            // In code blocks:
            // This removes backslashes,
            // puts back single quotes,
            // and replaces anything more than
            // two newlines with just two newlines.
            /```([\s\S]*?)```/g,
            (match, codeBlock) => {
                const normalized = codeBlock
                    .replace(/\\/g, "")
                    .replace(/\n{2,}/g, "\n\n");
                const final = `\`\`\`${normalized}\`\`\``;
                return final;
            }
        );
}
