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
    styleCss: Promise<string>
): Promise<string> {
    const fullHtml =
        "<!DOCTYPE html>\n" +
        (await renderTemplate<InteriorTemplateVars>(INTERIOR_TEMPLATE_PATH, {
            style: await styleCss,
            colorTestDates: getDateColorTestData().map(d => ({
                date: d.dateText,
                hue: d.hue,
            })),
            stats: getEntriesStats(entries).map(d => ({
                label: d.name,
                value: d.value.toLocaleString(),
            })),
            tagStats: await Promise.all(
                tagsLibrary.getOrderedTagsInfo().map(async t => ({
                    label: await t.htmlPromise,
                    value: t.count.toLocaleString(),
                }))
            ),
            entriesHtml: await processEntries(entries, tagsLibrary),
        }));

    return fullHtml;
}
