import { DayOneEntry } from "../types/DayOneEntry";
import config from "../../config.json";
import type { TagInfo } from "./internal/TagInfo";
import { processTags } from "./internal/process";

const staticTagsLibrary: TagInfo[] = [];

// TODO: Maybe we ought to rethink this,
// TODO: make it something that's passed around...
export function initializeStaticTags(
    entries: ReadonlyArray<DayOneEntry>
): void {
    staticTagsLibrary.push(...processTags(entries));
}

export function getTagHtml(tag: string): string {
    const infoIndex = staticTagsLibrary.findIndex(test => test.tag === tag);
    if (infoIndex < 0) throw new Error(`Unrecognized tag: ${tag}`);
    const info = staticTagsLibrary[infoIndex];
    if (!info) throw new Error(`Unrecognized tag: ${tag}`);

    const LOREM_IPSUM_TAGS = ["Lorem", "Ipsum", "Dolor", "Sit Amet"];
    const text = config.content.obfuscate
        ? LOREM_IPSUM_TAGS[info.count % LOREM_IPSUM_TAGS.length]
        : tag;

    return `<span class="tag-item" style="background-color: ${info.color}">${text}</span>`;
}

export function getOrderedStaticTagsInfo() {
    return staticTagsLibrary
        .map(item => ({
            tag: item.tag,
            html: getTagHtml(item.tag),
            count: item.count,
        }))
        .reverse(); // Reverse so highest counts are first
}
