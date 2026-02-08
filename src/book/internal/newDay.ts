import { getDateColor } from "../../date/color";
import type { NewDayTemplateVars } from "../../templates/newDay.hbs";
import type { DayOneEntry } from "../../types/DayOneEntry";
import { renderTemplate } from "../../utilities/template";

const TEMPLATE_PATH = "src/templates/newDay.hbs";

export function makeNewDayElement(entry: DayOneEntry): string {
    const date = new Date(entry.creationDate);
    // TODO: Define date text format in Template, not here.
    return renderTemplate<NewDayTemplateVars>(TEMPLATE_PATH, {
        monthColor: getDateColor(
            entry.creationDate,
            entry.location?.timeZoneName,
            0.4
        ),
        dateText: date.toLocaleString("en-US", {
            timeZone: entry.location?.timeZoneName,
            weekday: "long",
            year: undefined,
            month: "long",
            day: "numeric",
        }),
    });
}
