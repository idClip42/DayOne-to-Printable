import { DayOneEntry } from "../types/DayOneEntry";
import CONFIG from "./../config.json";
import { RenderStatsTable } from "./statsTable";

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
        const alpha = ((1 - CONFIG.ENTRIES.METADATA.TAGS.COLOR.MIN_ALPHA) * perc) + CONFIG.ENTRIES.METADATA.TAGS.COLOR.MIN_ALPHA;
        /** Use golden angle approximation to always get a different hue. */
        const hue = index * 137.508;
        const color = `hsla(${hue},${CONFIG.ENTRIES.METADATA.TAGS.COLOR.SATURATION},${CONFIG.ENTRIES.METADATA.TAGS.COLOR.LIGHTNESS},${alpha})`;
        return {
            ...item,
            "percentage": perc,
            "color": color
        };
    });

    tagsLibrary.push(...augmentedTags);
}

export function GetTagHtml(tag:string):string {
    const infoIndex = tagsLibrary.findIndex(test=>test.tag===tag);
    if(infoIndex < 0) throw new Error(`Unrecognized tag: ${tag}`);
    const info = tagsLibrary[infoIndex]
    if(!info) throw new Error(`Unrecognized tag: ${tag}`);

    const LOREM_IPSUM_TAGS = ["Lorem", "Ipsum", "Dolor", "Sit Amet"];
    const text = CONFIG.ENTRIES.CONTENT.LOREM_IPSUM_MODE ?
        LOREM_IPSUM_TAGS[info.count % LOREM_IPSUM_TAGS.length] :
        tag;

    return `<span class="tag-item" style="background-color: ${info.color}">${text}</span>`;
}

export function GetTagsListHtml():string {
    // Make a copy of the array and reverse it.
    // Highest numbers are now first.
    const tagItems = tagsLibrary.map(a=>a).reverse();

    const statItems:{[statName:string]:number} = {};
    for(const item of tagItems){
        statItems[GetTagHtml(item.tag)] = item.count
    }

    return `
<div id="tag-index">
    <h2>
        Tags
    </h2>
    ${RenderStatsTable(statItems)}
</div>
    `.trim();
}