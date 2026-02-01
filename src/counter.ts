import { DayOneEntry } from "../types/DayOneEntry";
import { RenderStatsTable } from "./statsTable";

type Counter = {
    "Entries": number,
    "Words": number,
    "Images": number,
    "Audio Clips": number,
    "Videos": number,
    "PDFs": number,
};

function CountEntryContents(entry:DayOneEntry): Counter{
    return {
        "Entries": 1,
        "Words": 0,
        "Images": entry.photos?.length || 0,
        "Audio Clips": entry.audios?.length || 0,
        "Videos": entry.videos?.length || 0,
        "PDFs": entry.pdfAttachments?.length || 0,
    }
}

function SumUpEntryContents(data: Counter[]):Counter{
    return data.reduce<Counter>((accumulator, nextVal) => {
        for(const key in accumulator)
            accumulator[key] += nextVal[key];
        return accumulator;
    }, {
        "Entries": 0,
        "Words": 0,
        "Images": 0,
        "Audio Clips": 0,
        "Videos": 0,
        "PDFs": 0,
    })
}

export function GetEntriesStatsHtml(entries:DayOneEntry[]):string{
    const stats = SumUpEntryContents(
        entries.map(CountEntryContents)
    );

    const fullHTML = `
<div>
    <h2>
        Stats
    </h2>
    ${RenderStatsTable(stats)}
</div>
    `.trim();

    return fullHTML;
}