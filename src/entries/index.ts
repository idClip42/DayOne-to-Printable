import { DayOneEntry } from "../types/DayOneEntry";
import { CreateMetadataHtml } from "./internal/metadata";
import { CreateContentHtml } from "./internal/content";

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
