import { AttachInfo } from "./info";
import config from "./config.json";

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
    return `\n\n${config.attachmentTag} ${text}\n\n`;
}

function secondsToTimeString(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const extraSeconds = seconds - minutes * 60;
    return `${minutes}:${extraSeconds.toFixed(0).padStart(2, "0")}`;
}
