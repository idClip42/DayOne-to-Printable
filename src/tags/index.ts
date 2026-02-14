import { DayOneEntry } from "../types/DayOneEntry";
import config from "../../config.json";
import { processTags } from "./internal/process";
import { renderTemplate } from "../utilities/template";
import { TagTemplateVars } from "../templates/tag.hbs";

const TAG_TEMPLATE_PATH = "src/templates/tag.hbs";

export class TagsLibrary {
    private _tagsLibrary: ReturnType<typeof processTags>;

    constructor(entries: ReadonlyArray<DayOneEntry>) {
        this._tagsLibrary = processTags(entries);
    }

    public getTagHtml(tag: string): Promise<string> {
        const infoIndex = this._tagsLibrary.findIndex(test => test.tag === tag);
        if (infoIndex < 0) throw new Error(`Unrecognized tag: ${tag}`);
        const info = this._tagsLibrary[infoIndex];
        if (!info) throw new Error(`Unrecognized tag: ${tag}`);

        const LOREM_IPSUM_TAGS = ["Lorem", "Ipsum", "Dolor", "Sit Amet"];
        const text = config.content.obfuscate
            ? LOREM_IPSUM_TAGS[info.count % LOREM_IPSUM_TAGS.length]
            : tag;

        return renderTemplate<TagTemplateVars>(TAG_TEMPLATE_PATH, {
            tag: text,
            hue: info.hue,
            valuePerc: info.value * 100,
        });
    }

    public getOrderedTagsInfo() {
        return this._tagsLibrary
            .map(item => ({
                tag: item.tag,
                htmlPromise: this.getTagHtml(item.tag),
                count: item.count,
            }))
            .reverse(); // Reverse so highest counts are first
    }
}
