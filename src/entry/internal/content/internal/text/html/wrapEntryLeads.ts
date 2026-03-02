import * as cheerio from "cheerio";

const PREVENT_BREAK_CLASS = ".prevent-break";

// Tags that, if encountered, mean "grab one more element after this"
const includeNextTags = new Set(["h1"]);

// Tags that, if encountered, mean "stop wrapping immediately"
const stopTags = new Set(["ul"]);

export function wrapEntryLeads(entryHtml: string): string {
    const $ = cheerio.load(entryHtml, { xmlMode: false });

    const wrapper = $(PREVENT_BREAK_CLASS).first();
    if (!wrapper.length) {
        console.warn(`WARN: Expected '${PREVENT_BREAK_CLASS}' element.`);
        return entryHtml;
    }

    let toWrap = 1;

    while (toWrap > 0) {
        const firstEl = wrapper.next();
        if (!firstEl.length) break;

        const tagName = firstEl[0].tagName.toLowerCase();

        if (stopTags.has(tagName)) break;
        if (includeNextTags.has(tagName)) toWrap++;

        wrapper.append(firstEl);
        toWrap--;
    }

    return $("body").html() || "";
}
