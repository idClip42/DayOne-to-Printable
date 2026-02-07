import { getDateColor } from "../../date/color";
import { formatDate } from "../../date/format";
import type { NewDayTemplateVars } from "../../templates/newDay.hbs";
import type { DayOneEntry } from "../../types/DayOneEntry";
import { renderTemplate } from "../../utilities/template";

const TEMPLATE_PATH = "src/templates/newDay.hbs";

export function makeNewDayElement(entry: DayOneEntry): string {
    return renderTemplate<NewDayTemplateVars>(TEMPLATE_PATH, {
        monthColor: getDateColor(
            entry.creationDate,
            entry.location?.timeZoneName,
            0.4
        ),
        dateText: formatDate(
            entry.creationDate,
            entry.location?.timeZoneName,
            false
        ),
    });
}
