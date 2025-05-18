import { DayOneEntry } from "../types/DayOneEntry";

const ATTACHMENT_TAG = "THIS_IS_AN_ATTACHMENT";

type AttachPhoto = { "type": "Photo", "data": DayOneEntry["photos"][number] };
type AttachVideo = { "type": "Video", "data": DayOneEntry["videos"][number] };
type AttachAudio = { "type": "Audio", "data": DayOneEntry["audios"][number] };
type AttachPdf = { "type": "PDF", "data": DayOneEntry["pdfAttachments"][number] }

type AttachInfoMinusPhoto = 
    | AttachVideo
    | AttachAudio
    | AttachPdf;

type AttachInfo = AttachInfoMinusPhoto|AttachPhoto;

export function GetAttachmentInfo(entry:DayOneEntry, pathString:string):AttachInfo{
    if(pathString.startsWith("//")){
        const testStr = pathString.replace("//", "");
        return {
            "type": "Photo",
            "data": findData(entry.photos, pathString, p => p.identifier === testStr)
        };
    }
    else if(pathString.startsWith("/video/")){
        const testStr = pathString.replace("/video/", "");
        return {
            "type": "Video",
            "data": findData(entry.videos, pathString, p => p.identifier === testStr)
        };
    }
    else if(pathString.startsWith("/audio/")){
        const testStr = pathString.replace("/audio/", "");
        return {
            "type": "Audio",
            "data": findData(entry.audios, pathString, p => p.identifier === testStr)
        };
    }
    else if(pathString.startsWith("/pdfAttachment/")){
        const testStr = pathString.replace("/pdfAttachment/", "");
        return {
            "type": "PDF",
            "data": findData(entry.pdfAttachments, pathString, p => p.identifier === testStr)
        };
    }
    else {
        throw new Error(`Unhandled attachment path: '${pathString}'.`);
    }
}

export function GetAttachmentText(info:AttachInfoMinusPhoto):string {
    if(info.type === "Audio"){
        return `${info.type}: ${info.data.title}, ${secondsToTimeString(info.data.duration)}`;
    }
    else if(info.type === "Video"){
        return `${info.type}: ${secondsToTimeString(info.data.duration)}`;
    }
    else if(info.type === "PDF"){
        return `Document: ${info.data.pdfName}.${info.data.type}`;
    }
    else {
        const badInput = info as any;
        throw new Error(`Unhandled attachment type: '${badInput.type}'.`);
    }
}

export function GetAttachmentMarkdown(text:string):string{
    return `\n\n${ATTACHMENT_TAG} ${text}\n\n`;
}

export function UpdateHtmlAttachments(htmlText:string):string{
    let resultString = htmlText.replace(
        new RegExp(`<p>${ATTACHMENT_TAG}`, 'g'),
        "<p class='attachment-block'>"
    );

    if(resultString.includes(ATTACHMENT_TAG))
        throw new Error(`Failed to remove all instances of '${ATTACHMENT_TAG}'.`);

    return resultString;
}

function findData<T>(set:T[], pathString:string, predicate:(test:T)=>boolean):T{
    if(!set) throw new Error(`Missing photos in entry, cannot find '${pathString}'.`);
    const photoInfo = set.find(predicate);
    if(!photoInfo) throw new Error(`No photo info for path '${pathString}'.`);
    return photoInfo;
}

function secondsToTimeString(seconds:number):string {
    const minutes = Math.floor(seconds / 60);
    const extraSeconds = seconds - (minutes * 60);
    return `${minutes}:${extraSeconds.toFixed(0).padStart(2, "0")}`;
}