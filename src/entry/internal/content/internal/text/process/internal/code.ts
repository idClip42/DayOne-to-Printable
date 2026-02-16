const REGEX_REJOIN = /```[\n\r]+```/g;
const REGEX_BACKSLASHES_A = /```([\s\S]*?)```/g;
const REGEX_BACKSLASHES_B = /\\/g;
const REGEX_BACKSLASHES_C = /\n{2,}/g;

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
            REGEX_REJOIN,
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
            REGEX_BACKSLASHES_A,
            (match, codeBlock) => {
                const normalized = codeBlock
                    .replace(REGEX_BACKSLASHES_B, "")
                    .replace(REGEX_BACKSLASHES_C, "\n\n");
                const final = `\`\`\`${normalized}\`\`\``;
                return final;
            }
        );
}
