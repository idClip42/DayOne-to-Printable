import { AttachmentTemplateVars } from "../../../../../templates/attachment.hbs";
import { renderTemplate } from "../../../../../utilities/template";
import { AttachInfo } from "./info";

const TEMPLATE_PATH = "src/templates/attachment.hbs";

export function getAttachmentText(info: AttachInfo): string {
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

export function getAttachmentMarkdown(text: string): string {
    const htmlBlock = renderTemplate<AttachmentTemplateVars>(TEMPLATE_PATH, {
        text: text,
    });
    return `\n\n${htmlBlock}\n\n`;
}

function secondsToTimeString(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const extraSeconds = seconds - minutes * 60;
    return `${minutes}:${extraSeconds.toFixed(0).padStart(2, "0")}`;
}
