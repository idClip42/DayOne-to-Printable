import { DayOneEntry } from "../../../types/DayOneEntry";

function getDayOfWeek(iso: string, timeZone: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
        timeZone,
        weekday: "long",
    });
}

export function createDateHtml(entry: DayOneEntry): string {
    const date = new Date(entry.creationDate);
    return date.toLocaleString("en-US", {
        timeZone: entry.location?.timeZoneName,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function createDateTimeHtml(entry: DayOneEntry): string {
    const d = new Date(entry.creationDate);

    const datePart = d.toLocaleDateString("en-US", {
        timeZone: entry.location?.timeZoneName,
        year: undefined,
        month: "long",
        day: "numeric",
    });

    let timePart = d.toLocaleTimeString("en-US", {
        timeZone: entry.location?.timeZoneName,
        hour: "numeric",
        minute: "2-digit",
    });
    if (!timePart.endsWith("AM") && !timePart.endsWith("PM"))
        throw new Error("Time string not ending as expected.");
    // TODO: Is it worth moving this into a template because it's HTML?
    timePart = timePart.replace(
        /\s?(AM|PM)$/,
        '<span class="am-pm"> $1</span>'
    );

    return `${datePart} · ${timePart}`;
}

export function createDayOfWeekHtml(entry: DayOneEntry): string {
    const weekday = getDayOfWeek(
        entry.creationDate,
        entry.location?.timeZoneName
    );
    return weekday;
}
