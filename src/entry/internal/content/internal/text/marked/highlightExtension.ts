import type { marked } from "marked";

/**
 * Extension of `marked` to support DayOne
 * ==highlight== syntax.
 */
export const highlightExtension: Parameters<
    (typeof marked)["use"]
>[0]["extensions"][number] = {
    name: "highlight",
    level: "inline",

    start(src: string) {
        // Hint to marked where scanning can start
        return src.indexOf("==");
    },

    tokenizer(src: string) {
        // Match ==something== but not empty
        const match = /^==([\s\S]+?)==/.exec(src);
        if (!match) return;

        return {
            type: "highlight",
            raw: match[0],
            text: match[1],
            tokens: this.lexer.inlineTokens(match[1]),
        };
    },

    renderer(token: any) {
        return `<mark>${this.parser.parseInline(token.tokens)}</mark>`;
    },
};
