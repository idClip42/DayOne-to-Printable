import { DayOneEntry } from "../types/DayOneEntry";
import CONFIG from "./../config.json";

const tagsLibrary:{
    "tag": string,
    "count": number,
    "percentage": number,
    "color": string
}[] = [];

export function InitializeTags(entries: ReadonlyArray<DayOneEntry>):void{
    const tagCounter:Record<string,number> = {};
    for(const entry of entries){
        if(!entry.tags) continue;
        for(const tag of entry.tags){
            if(tagCounter.hasOwnProperty(tag)){
                tagCounter[tag]++;
            }
            else {
                tagCounter[tag] = 1;
            }
        }
    }

    const sortedTags = Object.keys(tagCounter).map(key => {
        return {
            "tag": key,
            "count": tagCounter[key]
        };
    }).sort((a, b) => a.count - b.count);
    const MIN_TAGS = sortedTags[0].count;
    const MAX_TAGS = sortedTags[sortedTags.length-1].count;

    const augmentedTags = sortedTags.map((item, index) => {
        const perc = (item.count - MIN_TAGS) / (MAX_TAGS - MIN_TAGS);
        const alpha = ((1 - CONFIG.TAG_COLOR_MIN_ALPHA) * perc) + CONFIG.TAG_COLOR_MIN_ALPHA;
        /** Use golden angle approximation to always get a different hue. */
        const hue = index * 137.508;
        const color = `hsla(${hue},${CONFIG.TAG_COLOR_SATURATION},${CONFIG.TAG_COLOR_LIGHTNESS},${alpha})`;
        return {
            ...item,
            "percentage": perc,
            "color": color
        };
    });

    tagsLibrary.push(...augmentedTags);
}

export function GetTagHtml(tag:string):string {
    const info = tagsLibrary.find(test=>test.tag===tag);
    if(!info) throw new Error(`Unrecognized tag: ${tag}`);
    const color = info.color;
    return `
<span class="tag-item" style="background-color: ${color}">
    ${tag}
</span>
    `.trim();
}

export function GetTagsListHtml():string {

    const tagItems = tagsLibrary.map(tagItem => {
        return `
<li>
    ${GetTagHtml(tagItem.tag)}
    :
    ${tagItem.count}
</li>
        `.trim();
    }).reverse();

    return `
<div id="tag-index">
    <h2>
        Tags
    </h2>
    <ul>
        ${tagItems.join("\n")}
    </ul>
</div>
    `.trim();
}