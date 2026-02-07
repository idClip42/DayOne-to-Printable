import { getDateColorTestData } from "../date/color";
import { getEntriesStats } from "../stats";
import { getOrderedStaticTagsInfo } from "../tags";
import { InteriorTemplateVars } from "../templates/interior.hbs";
import { DayOneEntry } from "../types/DayOneEntry";
import { renderTemplate } from "../utilities/template";
import { processEntries } from "./internal/processEntries";

const INTERIOR_TEMPLATE_PATH = "src/templates/interior.hbs";

export function buildFullHtml(
    entries: DayOneEntry[],
    styleCss: string
): string {
    const fullHtml = renderTemplate<InteriorTemplateVars>(
        INTERIOR_TEMPLATE_PATH,
        {
            style: styleCss,
            colorTestDates: getDateColorTestData().map(d => ({
                date: d.dateText,
                color: d.color,
            })),
            stats: getEntriesStats(entries).map(d => ({
                label: d.name,
                value: d.value.toLocaleString(),
            })),
            tagStats: getOrderedStaticTagsInfo().map(t => ({
                label: t.html,
                value: t.count.toLocaleString(),
            })),
            entriesHtml: processEntries(entries),
        }
    );

    return fullHtml;
}
