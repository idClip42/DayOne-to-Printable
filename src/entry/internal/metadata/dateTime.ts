import { DayOneEntry } from "../../../types/DayOneEntry";

export function getDateTimeStrings(entry: DayOneEntry) {
    const date = new Date(entry.creationDate);
    const timezone = entry.location?.timeZoneName;
    const timeRaw = date.toLocaleTimeString("en-US", {
        timeZone: timezone,
        hour: "numeric",
        minute: "2-digit",
    });
    // Holy shit you can do this?
    const [timeStr, amPmStr] = timeRaw.split(" ");

    return {
        weekday: date.toLocaleDateString("en-US", {
            timeZone: timezone,
            weekday: "long",
        }),
        monthDay: date.toLocaleDateString("en-US", {
            timeZone: timezone,
            month: "long",
            day: "numeric",
        }),
        year: date.toLocaleDateString("en-US", {
            timeZone: timezone,
            year: "numeric",
        }),
        time: timeStr,
        amPm: amPmStr,
    };
}
