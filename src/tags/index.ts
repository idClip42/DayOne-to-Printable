import { DayOneEntry } from "../types/DayOneEntry";
import config from "../../config.json";
import { processTags } from "./internal/process";
import { renderTemplate } from "../utilities/template";
import { TagTemplateVars } from "../templates/tag.hbs";

const TAG_TEMPLATE_PATH = "src/templates/tag.hbs";
const LOREM_IPSUM_TAGS = ["Lorem", "Ipsum", "Dolor", "Sit Amet"];

type SimpleTagInfo = {
    tag: string;
    htmlPromise: Promise<string>;
    count: number;
};

type TagLibraryItem = Readonly<
    ReturnType<typeof processTags>[number] & {
        htmlPromise: Promise<string>;
    }
>;

export class TagsLibrary {
    private readonly _tagsLibrary: ReadonlyArray<TagLibraryItem>;

    constructor(entries: ReadonlyArray<DayOneEntry>) {
        this._tagsLibrary = processTags(entries)
            .map(tagObj => {
                const text = config.content.obfuscate
                    ? LOREM_IPSUM_TAGS[tagObj.count % LOREM_IPSUM_TAGS.length]
                    : tagObj.tag;

                const htmlPromise = renderTemplate<TagTemplateVars>(
                    TAG_TEMPLATE_PATH,
                    {
                        tag: text,
                        hue: tagObj.hue,
                        valuePerc: tagObj.value * 100,
                    }
                );

                return {
                    ...tagObj,
                    htmlPromise,
                };
            })
            .reverse(); // Reverse so highest counts are first
    }

    public getTagHtml(tag: string): Promise<string> {
        return this._tagsLibrary.find(t => t.tag === tag).htmlPromise;
    }

    public getOrderedTagsInfo(): SimpleTagInfo[] {
        return this._tagsLibrary.map<SimpleTagInfo>(item => ({
            tag: item.tag,
            htmlPromise: item.htmlPromise,
            count: item.count,
        }));
    }
}
