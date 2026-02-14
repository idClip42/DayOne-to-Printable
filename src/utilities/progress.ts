import type { DayOneEntry } from "../types/DayOneEntry";

export function logProgress(entryIndex: number, entries: DayOneEntry[]) {
    const entry = entries[entryIndex];
    const perc = entryIndex / entries.length;
    console.log(
        `Entries processed: ${(perc * 100).toFixed(2)}% (${new Date(entry.creationDate).toDateString()})`
    );
}
