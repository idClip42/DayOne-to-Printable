import { DayOneEntry } from "../types/DayOneEntry";
import config from "../../config.json";
import type { TagInfo } from "./internal/TagInfo";
import { processTags } from "./internal/process";

export class TagsLibrary {
    private _tagsLibrary: TagInfo[];

    constructor(entries: ReadonlyArray<DayOneEntry>) {
        this._tagsLibrary = processTags(entries);
    }

    public getTagHtml(tag: string): string {
        const infoIndex = this._tagsLibrary.findIndex(test => test.tag === tag);
        if (infoIndex < 0) throw new Error(`Unrecognized tag: ${tag}`);
        const info = this._tagsLibrary[infoIndex];
        if (!info) throw new Error(`Unrecognized tag: ${tag}`);

        const LOREM_IPSUM_TAGS = ["Lorem", "Ipsum", "Dolor", "Sit Amet"];
        const text = config.content.obfuscate
            ? LOREM_IPSUM_TAGS[info.count % LOREM_IPSUM_TAGS.length]
            : tag;

        // TODO: Template!
        return `<span class="tag-item" style="background-color: ${info.color}">${text}</span>`;
    }

    public getOrderedTagsInfo() {
        return this._tagsLibrary
            .map(item => ({
                tag: item.tag,
                html: this.getTagHtml(item.tag),
                count: item.count,
            }))
            .reverse(); // Reverse so highest counts are first
    }
}
