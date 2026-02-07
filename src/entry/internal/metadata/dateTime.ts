import { DayOneEntry } from "../../../types/DayOneEntry";
import { formatDate, formatDateTime } from "../../../date/format";

function getDayOfWeek(iso: string, timeZone: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
        timeZone,
        weekday: "long",
    });
}

export function createDateHtml(entry: DayOneEntry): string {
    const formattedDateTime = formatDate(
        entry.creationDate,
        entry.location?.timeZoneName,
        true
    );
    return formattedDateTime;
}

export function createDateTimeHtml(entry: DayOneEntry): string {
    const formattedDateTime = formatDateTime(
        entry.creationDate,
        entry.location?.timeZoneName,
        false
    );
    return formattedDateTime;
}

export function createDayOfWeekHtml(entry: DayOneEntry): string {
    const weekday = getDayOfWeek(
        entry.creationDate,
        entry.location?.timeZoneName
    );
    return weekday;
}
