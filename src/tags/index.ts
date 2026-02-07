import { DayOneEntry } from "../types/DayOneEntry";
import CONFIG from "../../config.json";
import { RenderInfoTable } from "../utilities/infoTable";
import type { TagInfo } from "./internal/TagInfo";
import { ProcessTags } from "./internal/process";

const staticTagsLibrary: TagInfo[] = [];

export function InitializeTags(entries: ReadonlyArray<DayOneEntry>): void {
    staticTagsLibrary.push(...ProcessTags(entries));
}

export function GetTagHtml(tag: string): string {
    const infoIndex = staticTagsLibrary.findIndex(test => test.tag === tag);
    if (infoIndex < 0) throw new Error(`Unrecognized tag: ${tag}`);
    const info = staticTagsLibrary[infoIndex];
    if (!info) throw new Error(`Unrecognized tag: ${tag}`);

    const LOREM_IPSUM_TAGS = ["Lorem", "Ipsum", "Dolor", "Sit Amet"];
    const text = CONFIG.content.obfuscate
        ? LOREM_IPSUM_TAGS[info.count % LOREM_IPSUM_TAGS.length]
        : tag;

    return `<span class="tag-item" style="background-color: ${info.color}">${text}</span>`;
}

// TODO: This can probably be moved into the eventual HTML template.
export function GetTagsListHtml(): string {
    // Make a copy of the array and reverse it.
    // Highest numbers are now first.
    const tagItems = staticTagsLibrary.map(a => a).reverse();

    const statItems: { [statName: string]: number } = {};
    for (const item of tagItems) {
        statItems[GetTagHtml(item.tag)] = item.count;
    }

    return `
<div id="tag-index" class="stats-group">
    <h2>
        Tags
    </h2>
    ${RenderInfoTable(statItems)}
</div>
    `.trim();
}
