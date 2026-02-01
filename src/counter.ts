import { DayOneEntry } from "../types/DayOneEntry";

type Counter = {
    "entries": number,
    "words": number,
    "images": number,
    "audios": number,
    "videos": number,
    "pdfs": number,
};

export function CountEntryContents(entry:DayOneEntry): Counter{
    return {
        "entries": 1,
        "words": 0,
        "images": entry.photos?.length || 0,
        "audios": entry.audios?.length || 0,
        "videos": entry.videos?.length || 0,
        "pdfs": entry.pdfAttachments?.length || 0,
    }
}

export function SumUpEntryContents(data: Counter[]){
    return data.reduce<Counter>((accumulator, nextVal) => {
        for(const key in accumulator)
            accumulator[key] += nextVal[key];
        return accumulator;
    }, {
        "entries": 0,
        "words": 0,
        "images": 0,
        "audios": 0,
        "videos": 0,
        "pdfs": 0,
    })
}