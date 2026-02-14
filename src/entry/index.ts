import { DayOneEntry } from "../types/DayOneEntry";
import { createContentHtml } from "./internal/content";
import { EntryTemplateVars } from "../templates/entry.hbs";
import { renderTemplate } from "../utilities/template";
import { getDateHue } from "../date/color";
import { getWeather } from "./internal/metadata/weather";
import { getLocationString } from "./internal/metadata/location";
import type { TagsLibrary } from "../tags";
import { getDateTimeStrings } from "./internal/metadata/dateTime";

const TEMPLATE_PATH = "src/templates/entry.hbs";

export async function convertEntryToHTML(
    entry: DayOneEntry,
    tagsLibrary: TagsLibrary
): Promise<string> {
    const dateTime = getDateTimeStrings(entry);
    const weather = getWeather(entry);

    const contentHtmlPromise = createContentHtml(entry);
    const tagHtmlsPromise = entry.tags
        ? await Promise.all(entry.tags.map(t => tagsLibrary.getTagHtml(t)))
        : Promise.resolve([]);

    return renderTemplate<EntryTemplateVars>(TEMPLATE_PATH, {
        contentHtml: await contentHtmlPromise,
        monthHue: getDateHue(
            new Date(entry.creationDate),
            entry.location?.timeZoneName
        ),
        weekday: dateTime.weekday,
        monthDay: dateTime.monthDay,
        year: dateTime.year,
        time: dateTime.time,
        amPm: dateTime.amPm,
        weather: weather.weather,
        tempF: weather.tempF,
        location: getLocationString(entry),
        tagHtmls: await tagHtmlsPromise,
    });
}
