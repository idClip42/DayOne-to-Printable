import { DayOneEntry } from "../types/DayOneEntry";
import { createContentHtml } from "./internal/content";
import { EntryTemplateVars } from "../templates/entry.hbs";
import { renderTemplate } from "../utilities/template";
import { getDateColor } from "../date/color";
import {
    createDateHtml,
    createDateTimeHtml,
    createDayOfWeekHtml,
} from "./internal/metadata/dateTime";
import { getWeatherString } from "./internal/metadata/weather";
import { getLocationString } from "./internal/metadata/location";
import type { TagsLibrary } from "../tags";

const TEMPLATE_PATH = "src/templates/entry.hbs";

export function convertEntryToHTML(
    entry: DayOneEntry,
    tagsLibrary: TagsLibrary
): string {
    return renderTemplate<EntryTemplateVars>(TEMPLATE_PATH, {
        contentHtml: createContentHtml(entry),
        monthColor: getDateColor(
            entry.creationDate,
            entry.location?.timeZoneName,
            0.75
        ),
        weekday: createDayOfWeekHtml(entry),
        weather: getWeatherString(entry),
        dateTime: createDateTimeHtml(entry),
        pageHeaderFullDate: createDateHtml(entry),
        location: getLocationString(entry),
        tagHtmls: entry.tags?.map(t => tagsLibrary.getTagHtml(t)) || [],
    });
}
