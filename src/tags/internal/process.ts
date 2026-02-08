import type { DayOneEntry } from "../../types/DayOneEntry";
import { numberToHue } from "../../utilities/color";

const MIN_LIGHTNESS = 0.5;
const MAX_LIGHTNESS = 0.75;

type TagInfo = {
    tag: string;
    count: number;
    /** In degrees. */
    hue: number;
    /** Between 0 and 1. */
    value: number;
};

export function processTags(entries: ReadonlyArray<DayOneEntry>): TagInfo[] {
    const sortedTags = sortTags(countUpTags(entries));
    const MIN_TAGS = sortedTags[0].count;
    const MAX_TAGS = sortedTags[sortedTags.length - 1].count;

    const augmentedTags = sortedTags.map<TagInfo>((item, index) => {
        const hue = numberToHue(index, 0);
        const value = lerp(
            MIN_LIGHTNESS,
            MAX_LIGHTNESS,
            inverseLerp(MAX_TAGS, MIN_TAGS, item.count)
        );
        return {
            tag: item.tag,
            count: item.count,
            hue: hue,
            value: value,
        };
    });

    return augmentedTags;
}

function countUpTags(entries: ReadonlyArray<DayOneEntry>) {
    const tagCounter: Record<string, number> = {};
    for (const entry of entries) {
        if (!entry.tags) continue;
        for (const tag of entry.tags) {
            if (tagCounter.hasOwnProperty(tag)) {
                tagCounter[tag]++;
            } else {
                tagCounter[tag] = 1;
            }
        }
    }
    return tagCounter;
}

function sortTags(tagCounter: ReturnType<typeof countUpTags>) {
    const sortedTags = Object.keys(tagCounter)
        .map(key => {
            return {
                tag: key,
                count: tagCounter[key],
            };
        })
        .sort((a, b) => a.count - b.count);
    return sortedTags;
}

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

function inverseLerp(a: number, b: number, value: number) {
    return (value - a) / (b - a);
}
