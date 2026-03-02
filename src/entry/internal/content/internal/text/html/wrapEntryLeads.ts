import * as cheerio from "cheerio";

const PREVENT_BREAK_CLASS = ".prevent-break";

/**
 * Tags that, when encountered at the start of content, indicate
 * that we should also include the next sibling in the wrapped block.
 * Example: an <h1> at the start usually indicates a "lead" section
 * that should stay with the header metadata.
 */
const includeNextTags = new Set(["h1"]);

/**
 * Tags that, when encountered at the start of content, mean we
 * should stop wrapping immediately. These typically represent
 * content that might be too long to wrap with the header
 * (e.g., lists).
 */
const stopTags = new Set(["ul"]);

/**
 * Wraps the leading content elements of a DayOne entry into the
 * existing `.prevent-break` div, based on tag rules.
 *
 * Steps:
 * 1. Find the `.prevent-break` wrapper already in the entry template.
 * 2. Look at the siblings immediately after it.
 * 3. Iteratively move elements into the wrapper according to rules:
 *    - Stop if the element's tag is in `stopTags`.
 *    - If the element's tag is in `includeNextTags`, include the next element too.
 *    - Always append the current element to the wrapper.
 *
 * @param entryHtml The HTML string for a single DayOne entry.
 * @returns The updated HTML string with the leading elements wrapped.
 */
export function wrapEntryLeads(entryHtml: string): string {
    const $ = cheerio.load(entryHtml, { xmlMode: false });

    // Find the existing wrapper div in the template
    const wrapper = $(PREVENT_BREAK_CLASS).first();
    if (!wrapper.length) {
        console.warn(`WARN: Expected '${PREVENT_BREAK_CLASS}' element.`);
        return entryHtml; // nothing to do if the wrapper doesn't exist
    }

    // Number of elements we want to move into the wrapper.
    // Start with 1 (always grab at least the first content element)
    let toWrap = 1;

    // Loop until we've wrapped all intended elements
    while (toWrap > 0) {
        const firstEl = wrapper.next(); // get the immediate next sibling
        if (!firstEl.length) break; // stop if no more siblings

        // Normalize the tag name to lowercase for safe matching
        const tagName = firstEl[0].tagName.toLowerCase();

        // Stop wrapping if we hit a tag in stopTags
        if (stopTags.has(tagName)) break;

        // If this tag indicates we should include another element, increment toWrap
        if (includeNextTags.has(tagName)) toWrap++;

        // Move this element into the wrapper
        wrapper.append(firstEl);

        // We've processed one element, decrement counter
        toWrap--;
    }

    // Return the updated HTML; fallback to input HTML if somehow null
    return $("body").html() || entryHtml;
}
