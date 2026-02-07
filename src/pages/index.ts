import { GetDateColor, GetDateColorTestData } from "../date/color";
import { isSameLocalDay } from "../date/compare";
import { formatDate } from "../date/format";
import { convertEntryToHTML } from "../entries";
import { GetEntriesStats } from "../stats";
import { GetOrderedStaticTagsInfo } from "../tags";
import { InteriorTemplateVars } from "../templates/interior.hbs";
import { DayOneEntry } from "../types/DayOneEntry";
import { renderTemplate } from "../utilities/template";

const INTERIOR_TEMPLATE_PATH = "src/templates/interior.hbs";

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

    const fullHtml = renderTemplate<InteriorTemplateVars>(
        INTERIOR_TEMPLATE_PATH,
        {
            style: styleCss,
            colorTestDates: GetDateColorTestData().map(d => ({
                date: d.dateText,
                color: d.color,
            })),
            stats: GetEntriesStats(entries).map(d => ({
                label: d.name,
                value: d.value.toLocaleString(),
            })),
            tagStats: GetOrderedStaticTagsInfo().map(t => ({
                label: t.html,
                value: t.count.toLocaleString(),
            })),
            entriesHtml: entriesHtml,
        }
    );

    return fullHtml;
}
