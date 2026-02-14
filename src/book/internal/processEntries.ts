import { DayOneEntry } from "../../types/DayOneEntry";
import { isSameLocalDay } from "../../date/compare";
import { convertEntryToHTML } from "../../entry";
import { makeNewDayElement } from "./newDay";
import { TagsLibrary } from "../../tags";
import { logProgress } from "../../utilities/progress";

export function processEntries(
    entries: DayOneEntry[],
    tagsLibrary: TagsLibrary
): Promise<string[]> {
    const entriesHtmlPromises: Promise<string>[] = [];
    let finishedCounter = 0;
    for (const e in entries) {
        const entryIndex = Number(e);

        const entry = entries[entryIndex];
        if (entry.isAllDay) {
            console.log(entry);
            throw new Error(
                "Hit an 'all day' entry - figure out what to do with it."
            );
        }

        if (!checkIsSameDay(entryIndex, entries)) {
            entriesHtmlPromises.push(Promise.resolve(makeNewDayElement(entry)));
        }

        const entryHtmlPromise = convertEntryToHTML(entry, tagsLibrary).then(
            result => {
                // Log progress when thing is complete
                finishedCounter++;
                if (
                    finishedCounter % 100 === 0 ||
                    finishedCounter === entries.length - 1
                )
                    logProgress(finishedCounter, entries);
                return result;
            }
        );
        entriesHtmlPromises.push(entryHtmlPromise);
    }
    return Promise.all(entriesHtmlPromises);
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
