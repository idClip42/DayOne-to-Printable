import { DayOneEntry } from "../../../types/DayOneEntry";

export function getDateTimeStrings(entry: DayOneEntry) {
    const date = new Date(entry.creationDate);
    const timeZone = entry.location?.timeZoneName;
    const timeRaw = date.toLocaleTimeString("en-US", {
        timeZone: timeZone,
        hour: "numeric",
        minute: "2-digit",
    });
    // Holy shit you can do this?
    const [timeStr, amPmStr] = timeRaw.split(" ");

    return {
        weekday: date.toLocaleDateString("en-US", {
            timeZone: timeZone,
            weekday: "long",
        }),
        monthDay: date.toLocaleDateString("en-US", {
            timeZone: timeZone,
            month: "long",
            day: "numeric",
        }),
        year: date.toLocaleDateString("en-US", {
            timeZone: timeZone,
            year: "numeric",
        }),
        time: timeStr,
        amPm: amPmStr,
    };
}
