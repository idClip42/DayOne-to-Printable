import type { DayOneEntry } from "../../types/DayOneEntry";
import type { TagInfo } from "./TagInfo";
import { numberToHue } from "../../utilities/color";

const MIN_ALPHA = 0.5;
const SATURATION = 0.75;
const BASE_LIGHTNESS = 0.5;

export function processTags(entries: ReadonlyArray<DayOneEntry>): TagInfo[] {
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

    const sortedTags = Object.keys(tagCounter)
        .map(key => {
            return {
                tag: key,
                count: tagCounter[key],
            };
        })
        .sort((a, b) => a.count - b.count);
    const MIN_TAGS = sortedTags[0].count;
    const MAX_TAGS = sortedTags[sortedTags.length - 1].count;

    const augmentedTags = sortedTags.map((item, index) => {
        const perc = (item.count - MIN_TAGS) / (MAX_TAGS - MIN_TAGS);
        const hue = numberToHue(index, 0);

        // TODO: Clean up the mess you've made here. Simplify this.

        // We're adjusting the lightness instead of setting an alpha
        // in order to try and eliminate any transparency.
        const lightnessAdjusted = (() => {
            const baseLightness = BASE_LIGHTNESS;
            const maxLightness =
                baseLightness + (1 - baseLightness) * MIN_ALPHA;
            const a = baseLightness;
            const b = maxLightness;
            const alpha = 1 - perc;
            return a + alpha * (b - a);
        })();

        const color = `hsl(${hue},${SATURATION * 100}%,${lightnessAdjusted * 100}%)`;
        return {
            ...item,
            percentage: perc,
            color: color,
        };
    });

    return augmentedTags;
}
