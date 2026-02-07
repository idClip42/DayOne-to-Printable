import { DayOneEntry } from "../../types/DayOneEntry";
import { CreateMetadataHtml } from "./entryMeta";
import { CreateContentHtml } from "./content/content";

export function convertEntryToHTML(entry: DayOneEntry): string {
    return `
<article class="entry">
    ${CreateMetadataHtml(entry)}
    <div class="entry-content">
        ${CreateContentHtml(entry)}
    </div>
</article>
    `.trim();
}
