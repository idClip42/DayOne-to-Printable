import { GetDateColor, GetDateColorTestData } from "../date/color";
import { isSameLocalDay } from "../date/compare";
import { formatDate } from "../date/format";
import { convertEntryToHTML } from "../entry";
import { GetEntriesStats } from "../stats";
import { GetOrderedStaticTagsInfo } from "../tags";
import { InteriorTemplateVars } from "../templates/interior.hbs";
import { DayOneEntry } from "../types/DayOneEntry";
import { renderTemplate } from "../utilities/template";
import { processEntries } from "./internal/processEntries";

const INTERIOR_TEMPLATE_PATH = "src/templates/interior.hbs";

export function BuildFullHtml(
    entries: DayOneEntry[],
    styleCss: string
): string {
    const fullHtml = renderTemplate<InteriorTemplateVars>(
        INTERIOR_TEMPLATE_PATH,
        {
            style: styleCss,
            colorTestDates: GetDateColorTestData().map(d => ({
                date: d.dateText,
                color: d.color,
            })),
            stats: GetEntriesStats(entries).map(d => ({
                label: d.name,
                value: d.value.toLocaleString(),
            })),
            tagStats: GetOrderedStaticTagsInfo().map(t => ({
                label: t.html,
                value: t.count.toLocaleString(),
            })),
            entriesHtml: processEntries(entries),
        }
    );

    return fullHtml;
}
