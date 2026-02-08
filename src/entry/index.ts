import { DayOneEntry } from "../types/DayOneEntry";
import { createContentHtml } from "./internal/content";
import { EntryTemplateVars } from "../templates/entry.hbs";
import { renderTemplate } from "../utilities/template";
import { getDateColor } from "../date/color";
import { getWeatherString } from "./internal/metadata/weather";
import { getLocationString } from "./internal/metadata/location";
import type { TagsLibrary } from "../tags";
import { getDateTimeStrings } from "./internal/metadata/dateTime";

const TEMPLATE_PATH = "src/templates/entry.hbs";

export function convertEntryToHTML(
    entry: DayOneEntry,
    tagsLibrary: TagsLibrary
): string {
    const dateTime = getDateTimeStrings(entry);
    return renderTemplate<EntryTemplateVars>(TEMPLATE_PATH, {
        contentHtml: createContentHtml(entry),
        monthColor: getDateColor(
            entry.creationDate,
            entry.location?.timeZoneName,
            0.75
        ),
        weekday: dateTime.weekday,
        monthDay: dateTime.monthDay,
        year: dateTime.year,
        time: dateTime.time,
        amPm: dateTime.amPm,
        weather: getWeatherString(entry),
        location: getLocationString(entry),
        tagHtmls: entry.tags?.map(t => tagsLibrary.getTagHtml(t)) || [],
    });
}
