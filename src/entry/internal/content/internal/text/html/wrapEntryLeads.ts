import * as cheerio from "cheerio";

const PREVENT_BREAK_CLASS = ".prevent-break";

export function wrapEntryLeads(entryHtml: string): string {
    const $ = cheerio.load(entryHtml, { xmlMode: false });

    const wrapper = $(PREVENT_BREAK_CLASS).first();
    if (!wrapper.length) {
        console.warn(`WARN: Expected '${PREVENT_BREAK_CLASS}' element.`);
        return entryHtml;
    }

    // Determine how many elements to wrap
    let toWrap = 1;

    while (toWrap > 0) {
        const firstEl = wrapper.next();
        if (!firstEl.length) break; // no more siblings

        if (firstEl.is("ul")) break;

        if (firstEl.is("h1")) toWrap++;

        wrapper.append(firstEl);
        toWrap--;
    }

    return $("body").html() || "";
}
