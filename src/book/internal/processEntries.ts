import { DayOneEntry } from "../../types/DayOneEntry";
import { isSameLocalDay } from "../../date/compare";
import { convertEntryToHTML } from "../../entry";
import { TagsLibrary } from "../../tags";

export function processEntries(
    entries: DayOneEntry[],
    tagsLibrary: TagsLibrary
): Promise<string[]> {
    return Promise.all(
        entries.map<Promise<string>>((entry, entryIndex) => {
            if (entry.isAllDay) {
                console.log(entry);
                throw new Error(
                    "Hit an 'all day' entry - figure out what to do with it."
                );
            }

            const isNewDay = !checkIsSameDay(entryIndex, entries);

            return convertEntryToHTML(entry, tagsLibrary, isNewDay);
        })
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
