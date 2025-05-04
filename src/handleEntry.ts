import { DayOneEntry } from "../types/DayOneEntry";
import { CreateMetadataHtml } from "./handleEntryMeta";
import { CreateContentHtml } from "./handleEntryContent";

export function convertEntryToHTML(entry: DayOneEntry): string {
    return `
<article class="entry">
    ${CreateMetadataHtml(entry)}
    ${CreateContentHtml(entry)}
</article>
    `.trim();
}