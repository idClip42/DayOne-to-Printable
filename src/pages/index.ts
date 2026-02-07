import { GetDateColor, GetDateColorTestHtml } from "../date/color";
import { isSameLocalDay } from "../date/compare";
import { formatDate } from "../date/format";
import { convertEntryToHTML } from "../entries";
import { GetEntriesStatsHtml } from "../stats";
import { GetTagsListHtml } from "../tags";
import { DayOneEntry } from "../types/DayOneEntry";

export function BuildFullHtml(
    entries: DayOneEntry[],
    styleCss: string
): string {
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

    const fullHTML = `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Journal Export</title>
    
            <style>
                ${styleCss}
            </style>
    
            <!-- Bringing in "pagedjs" package -->
            <script src="../node_modules/pagedjs/dist/paged.polyfill.js"></script>
        </head>
        <body>
            <div style="display: none">${GetDateColorTestHtml()}</div>
    
            ${GetEntriesStatsHtml(entries)}
            ${GetTagsListHtml()}    
            <div id="entries">
                ${entriesHtml.join("\n")}
            </div>
        </body>
    </html>
    `.trim();

    return fullHTML;
}
