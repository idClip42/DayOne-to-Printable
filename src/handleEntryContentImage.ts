import { DayOneEntry } from "../types/DayOneEntry";
import CONFIG from "../config.json";
import path from 'path';
import { RESIZED_IMAGES_EXT } from "./resizeImages";

export const ImageTokenSplit = /(!\[]\(dayone-moment:\/\/.*?\))/g;
export const ImageTokenMatch = /!\[]\(dayone-moment:\/\/(.*?)\)/;

const divStyle = CONFIG.ONLY_IMAGE_BORDERS ?
    "border-style: solid; border-color: lightgray;" :
    "";
const imgStyle = CONFIG.ONLY_IMAGE_BORDERS ?
    "opacity: 0" :
    "";

const photosDir = path.join(CONFIG.OUTPUT_DIR, CONFIG.PHOTOS_DIR); // Directory where your images are stored

function findPhoto(entry: DayOneEntry, id: string) {
    return entry.photos?.find(photo => photo.identifier === id);
}

export function CreateImageHtml(entry:DayOneEntry, photoId: string) {
    if(!CONFIG.INCLUDE_IMAGES)
        return "";
    
    const photo = findPhoto(entry, photoId);
    if (photo) {
        // const filename = `${photo.md5}.${photo.type}`;
        const filename = `${photo.md5}.${RESIZED_IMAGES_EXT}`;
        const srcFilePath = path.join("..", photosDir, filename);
        return `
<div class="entry-photo" style="${divStyle}">
    <img src="${srcFilePath}" alt="Photo" style="${imgStyle}" />
</div>
        `.trim();
    }
}