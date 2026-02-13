import { DayOneEntry } from "../../../../../types/DayOneEntry";

type AttachPhoto = { type: "Photo"; data: DayOneEntry["photos"][number] };
type AttachVideo = { type: "Video"; data: DayOneEntry["videos"][number] };
type AttachAudio = { type: "Audio"; data: DayOneEntry["audios"][number] };
type AttachPdf = { type: "PDF"; data: DayOneEntry["pdfAttachments"][number] };
export type AttachInfo = AttachVideo | AttachAudio | AttachPdf | AttachPhoto;

export function getAttachmentInfo(
    entry: DayOneEntry | null,
    pathString: string
): AttachInfo {
    if (pathString.startsWith("//")) {
        const testStr = pathString.replace("//", "");
        const data = findData(
            entry?.photos || [],
            pathString,
            p => p.identifier === testStr
        );
        return {
            type: "Photo",
            data: data || {
                date: entry?.creationDate || new Date().toISOString(),
                identifier: pathString,
                md5: "???",
                type: "???",
            },
        };
    } else if (pathString.startsWith("/video/")) {
        const testStr = pathString.replace("/video/", "");
        const data = findData(
            entry?.videos || [],
            pathString,
            p => p.identifier === testStr
        );
        return {
            type: "Video",
            data: data || {
                duration: 0,
                identifier: pathString,
                md5: "???",
                type: "???",
            },
        };
    } else if (pathString.startsWith("/audio/")) {
        const testStr = pathString.replace("/audio/", "");
        const data = findData(
            entry?.audios || [],
            pathString,
            p => p.identifier === testStr
        );
        return {
            type: "Audio",
            data: data || {
                duration: 0,
                format: "???",
                identifier: pathString,
                md5: "???",
                title: "???",
            },
        };
    } else if (pathString.startsWith("/pdfAttachment/")) {
        const testStr = pathString.replace("/pdfAttachment/", "");
        const data = findData(
            entry?.pdfAttachments || [],
            pathString,
            p => p.identifier === testStr
        );
        return {
            type: "PDF",
            data: data || {
                identifier: pathString,
                md5: "???",
                pdfName: "???",
                type: "???",
            },
        };
    } else {
        throw new Error(`Unhandled attachment path: '${pathString}'.`);
    }
}

function findData<T>(
    set: T[],
    pathString: string,
    predicate: (test: T) => boolean
): T | null {
    if (!set)
        throw new Error(
            `Missing photos in entry, cannot find '${pathString}'.`
        );
    const photoInfo = set.find(predicate);
    if (!photoInfo) {
        console.warn(`No photo info for path '${pathString}'.`);
        return null;
    }
    return photoInfo;
}
