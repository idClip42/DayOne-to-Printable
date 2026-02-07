import { DayOneEntry } from "../../types/DayOneEntry";
import { getDateColor } from "../../date/color";
import { isSameLocalDay } from "../../date/compare";
import { formatDate } from "../../date/format";
import { convertEntryToHTML } from "../../entry";
import { renderTemplate } from "../../utilities/template";
import { NewDayTemplateVars } from "../../templates/newDay.hbs";

const TEMPLATE_PATH = "src/templates/newDay.hbs";

export function processEntries(entries: DayOneEntry[]): string[] {
    const entriesHtml: string[] = [];
    for (const e in entries) {
        const entryIndex = Number(e);
        if (entryIndex % 100 === 0) logProgress(entryIndex, entries);

        const entry = entries[entryIndex];
        if (entry.isAllDay) {
            console.log(entry);
            throw new Error(
                "Hit an 'all day' entry - figure out what to do with it."
            );
        }

        if (!checkIsSameDay(entryIndex, entries)) {
            entriesHtml.push(
                renderTemplate<NewDayTemplateVars>(TEMPLATE_PATH, {
                    monthColor: getDateColor(
                        entry.creationDate,
                        entry.location?.timeZoneName,
                        0.4
                    ),
                    dateText: formatDate(
                        entry.creationDate,
                        entry.location?.timeZoneName,
                        false
                    ),
                })
            );
        }

        const entryHtml = convertEntryToHTML(entry);
        entriesHtml.push(entryHtml);
    }
    return entriesHtml;
}

function logProgress(entryIndex: number, entries: DayOneEntry[]) {
    const entry = entries[entryIndex];
    const perc = entryIndex / entries.length;
    console.log(
        `Entries processed: ${(perc * 100).toFixed(2)}% (${new Date(entry.creationDate).toDateString()})`
    );
}

function checkIsSameDay(entryIndex: number, entries: DayOneEntry[]) {
    if (entryIndex === 0) return false;
    const entry = entries[entryIndex];
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
}
