import { DayOneEntry } from "../types/DayOneEntry";

const ATTACHMENT_TAG = "THIS_IS_AN_ATTACHMENT";

type AttachPhoto = { type: "Photo"; data: DayOneEntry["photos"][number] };
type AttachVideo = { type: "Video"; data: DayOneEntry["videos"][number] };
type AttachAudio = { type: "Audio"; data: DayOneEntry["audios"][number] };
type AttachPdf = { type: "PDF"; data: DayOneEntry["pdfAttachments"][number] };

type AttachInfo = AttachVideo | AttachAudio | AttachPdf | AttachPhoto;

export function GetAttachmentInfo(
    entry: DayOneEntry,
    pathString: string
): AttachInfo {
    if (pathString.startsWith("//")) {
        const testStr = pathString.replace("//", "");
        const data = findData(
            entry.photos,
            pathString,
            p => p.identifier === testStr
        );
        return {
            type: "Photo",
            data: data || {
                date: entry.creationDate,
                identifier: pathString,
                md5: "???",
                type: "???",
            },
        };
    } else if (pathString.startsWith("/video/")) {
        const testStr = pathString.replace("/video/", "");
        const data = findData(
            entry.videos,
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
            entry.audios,
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
            entry.pdfAttachments,
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

export function GetAttachmentText(info: AttachInfo): string {
    if (info.type === "Photo") {
        let value = `${info.type}: Missing ${info.data.type} '${info.data.identifier}'`;
        if (info.data.filename) value += ` ('${info.data.filename}')`;
        return value;
    } else if (info.type === "Audio") {
        return `${info.type}: ${info.data.title}, ${secondsToTimeString(info.data.duration)}`;
    } else if (info.type === "Video") {
        return `${info.type}: ${secondsToTimeString(info.data.duration)}`;
    } else if (info.type === "PDF") {
        return `Document: ${info.data.pdfName}.${info.data.type}`;
    } else {
        const badInput = info as any;
        throw new Error(`Unhandled attachment type: '${badInput.type}'.`);
    }
}

export function GetAttachmentMarkdown(text: string): string {
    return `\n\n${ATTACHMENT_TAG} ${text}\n\n`;
}

export function UpdateHtmlAttachments(htmlText: string): string {
    let resultString = htmlText.replace(
        new RegExp(`<p>${ATTACHMENT_TAG}`, "g"),
        "<p class='attachment-block'>"
    );

    if (resultString.includes(ATTACHMENT_TAG))
        throw new Error(
            `Failed to remove all instances of '${ATTACHMENT_TAG}'.`
        );

    return resultString;
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

function secondsToTimeString(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const extraSeconds = seconds - minutes * 60;
    return `${minutes}:${extraSeconds.toFixed(0).padStart(2, "0")}`;
}
