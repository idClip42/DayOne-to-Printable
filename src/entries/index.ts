import { DayOneEntry } from "../types/DayOneEntry";
import { CreateContentHtml } from "./internal/content";
import { EntryTemplateVars } from "../templates/entry.hbs";
import { renderTemplate } from "../utilities/template";
import { getDateColor } from "../date/color";
import {
    CreateDateHtml,
    CreateDateTimeHtml,
    CreateDayOfWeekHtml,
} from "./internal/metadata/dateTime";
import { GetWeatherString } from "./internal/metadata/weather";
import { GetLocationString } from "./internal/metadata/location";
import { getTagHtml } from "../tags";

const TEMPLATE_PATH = "src/templates/entry.hbs";

export function convertEntryToHTML(entry: DayOneEntry): string {
    return renderTemplate<EntryTemplateVars>(TEMPLATE_PATH, {
        contentHtml: CreateContentHtml(entry),
        monthColor: getDateColor(
            entry.creationDate,
            entry.location?.timeZoneName,
            0.75
        ),
        weekday: CreateDayOfWeekHtml(entry),
        weather: GetWeatherString(entry),
        dateTime: CreateDateTimeHtml(entry),
        pageHeaderFullDate: CreateDateHtml(entry),
        location: GetLocationString(entry),
        tagHtmls: entry.tags?.map(getTagHtml) || [],
    });
}
