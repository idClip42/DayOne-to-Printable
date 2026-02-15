export function cleanBackslashes(input: string): string {
    // NOTE: We moved the quote block one to mid-quote block.
    return input
        .replace(
            // 20: URL Backslash Cleanup
            // Backslashes at this point are unprocessed markdown, and we can kill
            // all of them unless they're escaping another backslash.
            /(https?:\/\/.*)$/gm,
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
        );
}
