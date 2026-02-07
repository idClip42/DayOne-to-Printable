import { DayOneEntry } from "../../types/DayOneEntry";
import { RenderInfoTable } from "./infoTable";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";

type Counter = {
    Entries: number;
    Words: number;
    Images: number;
    "Audio Clips": number;
    Videos: number;
    PDFs: number;
};

export function countMarkdownWords(markdown: string): number {
    const tree = unified().use(remarkParse).parse(markdown);

    let text = "";

    visit(tree, "text", (node: any) => {
        text += " " + node.value;
    });

    return text.trim().split(/\s+/).filter(Boolean).length;
}

function CountEntryContents(entry: DayOneEntry): Counter {
    return {
        Entries: 1,
        Words: countMarkdownWords(entry.text),
        Images: entry.photos?.length || 0,
        "Audio Clips": entry.audios?.length || 0,
        Videos: entry.videos?.length || 0,
        PDFs: entry.pdfAttachments?.length || 0,
    };
}

function SumUpEntryContents(data: Counter[]): Counter {
    return data.reduce<Counter>(
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

export function GetEntriesStatsHtml(entries: DayOneEntry[]): string {
    const stats = SumUpEntryContents(entries.map(CountEntryContents));

    const fullHTML = `
<div id="stats-index" class="stats-group">
    <h2>
        Stats
    </h2>
    ${RenderInfoTable(stats)}
</div>
    `.trim();

    return fullHTML;
}
