import { DayOneEntry } from "../types/DayOneEntry";
import CONFIG from "../config.json";
import path from 'path';
import { RESIZED_IMAGES_EXT } from "./resizeImages";

export const ImageTokenSplit = /(!\[]\(dayone-moment:\/\/.*?\))/g;
export const ImageTokenMatch = /!\[]\(dayone-moment:\/\/(.*?)\)/;

const divStyle = CONFIG.ENTRIES.IMAGES.ONLY_BORDERS ?
    "border-style: solid; border-color: lightgray;" :
    "";
const imgStyle = CONFIG.ENTRIES.IMAGES.ONLY_BORDERS ?
    "opacity: 0" :
    "";

const photosDir = path.join(CONFIG.FILES.OUTPUT_DIR, CONFIG.FILES.PHOTOS_DIR); // Directory where your images are stored

function findPhoto(entry: DayOneEntry, id: string) {
    return entry.photos?.find(photo => photo.identifier === id);
}

export function CreateImageHtml(entry:DayOneEntry, photoId: string) {
    if(!CONFIG.ENTRIES.IMAGES.ENABLED)
        return "";
    
    const photo = findPhoto(entry, photoId);
    if (photo) {
        // const filename = `${photo.md5}.${photo.type}`;
        const filename = `${photo.md5}.${RESIZED_IMAGES_EXT}`;
        const srcFilePath = path.join("..", photosDir, filename);

        const divStyleString = divStyle ? `style="${divStyle}"` : "";
        const imgStyleString = imgStyle ? `style="${imgStyle}"` : "";

        return `
<div class="entry-photo" ${divStyleString}>
    <img src="${srcFilePath}" alt="Photo" ${imgStyleString} />
</div>
        `.trim();
    }
}