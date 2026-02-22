const REGEX_MOVE_FENCE_INDENT = /(\r?\n)(\s+)```(\r?\n)/g;
const REGEX_REJOIN = /```[\n\r]```/g;
const REGEX_BACKSLASHES_A = /```([\s\S]*?)```/g;
const REGEX_BACKSLASHES_B = /\\/g;
const REGEX_BACKSLASHES_C = /\n{2,}/g;

export function fixCode(input: string): string {
    return input
        .replace(
            // Normalize Indented Opening Fences
            // PURPOSE: DayOne sometimes indents opening triple-backticks.
            // Markdown treats this as structural indentation, which fragments
            // code blocks. This moves the indentation inside the fence so it
            // becomes literal code content instead.
            REGEX_MOVE_FENCE_INDENT,
            "$1```$3$2"
        )
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
