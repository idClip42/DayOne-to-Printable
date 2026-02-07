import { DayOneEntry } from "../../../../types/DayOneEntry";
import { formatDate, formatDateTime } from "../../../../date/format";
import CONFIG from "./../../../../../config.json";

function GetDayOfWeek(iso: string, timeZone: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
        timeZone,
        weekday: "long",
    });
}

export function CreateDateHtml(entry: DayOneEntry): string {
    const formattedDateTime = formatDate(
        entry.creationDate,
        entry.location?.timeZoneName,
        true
    );
    return formattedDateTime;
}

export function CreateDateTimeHtml(entry: DayOneEntry): string {
    const formattedDateTime = formatDateTime(
        entry.creationDate,
        entry.location?.timeZoneName,
        CONFIG.ENTRIES.METADATA.DATE_TIME.INCLUDE_YEAR
    );
    return formattedDateTime;
}

export function CreateDayOfWeekHtml(entry: DayOneEntry): string {
    const weekday = GetDayOfWeek(
        entry.creationDate,
        entry.location?.timeZoneName
    );
    return weekday;
}
