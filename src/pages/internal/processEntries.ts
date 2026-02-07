import { DayOneEntry } from "../../types/DayOneEntry";
import { GetDateColor } from "../../date/color";
import { isSameLocalDay } from "../../date/compare";
import { formatDate } from "../../date/format";
import { convertEntryToHTML } from "../../entry";

// TODO: Break this up a little, move the progress log into its own function.
// TODO: Handlebars template.

export function processEntries(entries: DayOneEntry[]): string[] {
    const entriesHtml: string[] = [];
    for (const e in entries) {
        const entryIndex = Number(e);
        const entry = entries[entryIndex];

        if (entryIndex % 100 === 0) {
            const perc = entryIndex / entries.length;
            console.log(
                `Entries processed: ${(perc * 100).toFixed(2)}% (${new Date(entry.creationDate).toDateString()})`
            );
        }

        if (entry.isAllDay) {
            console.log(entry);
            throw new Error(
                "Hit an 'all day' entry - figure out what to do with it."
            );
        }

        const isSameDay = (() => {
            if (entryIndex === 0) return false;
            const prevEntry = entries[entryIndex - 1];
            return isSameLocalDay(
                {
                    iso: prevEntry.creationDate,
                    timeZone: prevEntry.location?.timeZoneName,
                },
                {
                    iso: entry.creationDate,
                    timeZone: entry.location?.timeZoneName,
                }
            );
        })();
        if (!isSameDay) {
            const monthColor = GetDateColor(
                entry.creationDate,
                entry.location?.timeZoneName,
                0.4
            );
            entriesHtml.push(
                `<div class="new-day" style="color: ${monthColor}"><span>${formatDate(entry.creationDate, entry.location?.timeZoneName, false)}</span></div>`
            );
        }

        const entryHtml = convertEntryToHTML(entry);
        entriesHtml.push(entryHtml);
    }
    return entriesHtml;
}
