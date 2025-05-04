import { DayOneEntry } from "../types/DayOneEntry";
import CONFIG from "./../config.json";
import path from 'path';

export const ImageTokenSplit = /(!\[]\(dayone-moment:\/\/.*?\))/g;
export const ImageTokenMatch = /!\[]\(dayone-moment:\/\/(.*?)\)/;

const photosDir = path.join(CONFIG.INPUT_DIR, CONFIG.PHOTOS_DIR); // Directory where your images are stored

function findPhoto(entry: DayOneEntry, id: string) {
    return entry.photos?.find(photo => photo.identifier === id);
}

export function CreateImageHtml(entry:DayOneEntry, photoId: string) {
    const photo = findPhoto(entry, photoId);
    if (photo) {
        const filename = `${photo.md5}.${photo.type}`;
        const srcFilePath = path.join("..", photosDir, filename);
        return `
<div class="entry-photo">
    <img src="${srcFilePath}" alt="Photo" />
</div>
        `.trim();
    }
}