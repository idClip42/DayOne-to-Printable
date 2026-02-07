import { DayOneEntry } from "../types/DayOneEntry";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";

type StatsCounter = {
    Entries: number;
    Words: number;
    Images: number;
    "Audio Clips": number;
    Videos: number;
    PDFs: number;
};

function countMarkdownWords(markdown: string): number {
    const tree = unified().use(remarkParse).parse(markdown);

    let text = "";

    visit(tree, "text", (node: any) => {
        text += " " + node.value;
    });

    return text.trim().split(/\s+/).filter(Boolean).length;
}

function countEntryContents(entry: DayOneEntry): StatsCounter {
    return {
        Entries: 1,
        Words: countMarkdownWords(entry.text),
        Images: entry.photos?.length || 0,
        "Audio Clips": entry.audios?.length || 0,
        Videos: entry.videos?.length || 0,
        PDFs: entry.pdfAttachments?.length || 0,
    };
}

function sumUpEntryContents(data: StatsCounter[]): StatsCounter {
    return data.reduce<StatsCounter>(
        (accumulator, nextVal) => {
            for (const key in accumulator) accumulator[key] += nextVal[key];
            return accumulator;
        },
        {
            Entries: 0,
            Words: 0,
            Images: 0,
            "Audio Clips": 0,
            Videos: 0,
            PDFs: 0,
        }
    );
}

export function getEntriesStats(entries: DayOneEntry[]) {
    const stats = sumUpEntryContents(entries.map(countEntryContents));
    return Object.keys(stats).map(statName => ({
        name: statName,
        value: stats[statName],
    }));
}
