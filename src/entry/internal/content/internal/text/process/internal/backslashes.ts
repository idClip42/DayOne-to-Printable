const REGEX_URL_BACKSLASHES = /(https?:\/\/.*)$/gm;
const REGEX_CODE_BACKSLASHES = /`([^`\n]+)`/g;
const REGEX_BACKSLASHES = /\\([^\\])/g;

export function cleanBackslashes(input: string): string {
    // NOTE: We moved the quote block one to mid-quote block.
    return input
        .replace(
            // 20: URL Backslash Cleanup
            // Backslashes at this point are unprocessed markdown, and we can kill
            // all of them unless they're escaping another backslash.
            REGEX_URL_BACKSLASHES,
            line => line.replace(REGEX_BACKSLASHES, "$1")
        )
        .replace(
            // 22: Inline Code Backslash Cleanup
            // Get rid of stray backslashes in single-line code.
            // (We'll probably need to do this with code-blocks eventually too.)
            // Backslashes at this point are unprocessed markdown, and we can kill
            // all of them unless they're escaping another backslash.
            REGEX_CODE_BACKSLASHES,
            (_, code) => `\`${code.replace(REGEX_BACKSLASHES, "$1")}\``
        );
}
