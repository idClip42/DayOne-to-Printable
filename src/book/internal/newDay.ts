import { getDateHue } from "../../date/color";
import type { NewDayTemplateVars } from "../../templates/newDay.hbs";
import type { DayOneEntry } from "../../types/DayOneEntry";
import { renderTemplate } from "../../utilities/template";

const TEMPLATE_PATH = "src/templates/newDay.hbs";

export function makeNewDayElement(entry: DayOneEntry): Promise<string> {
    const date = new Date(entry.creationDate);
    const timeZone = entry.location?.timeZoneName;
    return renderTemplate<NewDayTemplateVars>(TEMPLATE_PATH, {
        monthHue: getDateHue(date, timeZone),
        weekday: date.toLocaleDateString("en-US", {
            timeZone: timeZone,
            weekday: "long",
        }),
        monthDay: date.toLocaleDateString("en-US", {
            timeZone: timeZone,
            month: "long",
            day: "numeric",
        }),
    });
}
