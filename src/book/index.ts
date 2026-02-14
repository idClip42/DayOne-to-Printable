import { getDateColorTestData } from "../date/color";
import { getEntriesStats } from "../stats";
import type { TagsLibrary } from "../tags";
import { InteriorTemplateVars } from "../templates/interior.hbs";
import { DayOneEntry } from "../types/DayOneEntry";
import { renderTemplate } from "../utilities/template";
import { processEntries } from "./internal/processEntries";

const INTERIOR_TEMPLATE_PATH = "src/templates/interior.hbs";

export async function buildFullHtml(
    entries: DayOneEntry[],
    tagsLibrary: TagsLibrary,
    styleCss: string
): Promise<string> {
    const fullHtml =
        "<!DOCTYPE html>\n" +
        renderTemplate<InteriorTemplateVars>(INTERIOR_TEMPLATE_PATH, {
            style: styleCss,
            colorTestDates: getDateColorTestData().map(d => ({
                date: d.dateText,
                hue: d.hue,
            })),
            stats: getEntriesStats(entries).map(d => ({
                label: d.name,
                value: d.value.toLocaleString(),
            })),
            tagStats: tagsLibrary.getOrderedTagsInfo().map(t => ({
                label: t.html,
                value: t.count.toLocaleString(),
            })),
            entriesHtml: await processEntries(entries, tagsLibrary),
        });

    return fullHtml;
}
