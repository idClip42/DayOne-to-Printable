import { DayOneEntry } from "../../../../../types/DayOneEntry";
import CONFIG from "../../../../../../config.json";
import path from "path";
import { RESIZED_IMAGES_EXT } from "../../../../../preprocess/resizeImages";
import fs from "fs";

const divStyle = CONFIG.content.obfuscate
    ? 'style="border-style: solid; border-color: lightgray;"'
    : "";
const imgStyle = CONFIG.content.obfuscate ? 'style="opacity: 0"' : "";

/** Directory where your images are stored */
const photosDir = path.join(
    CONFIG.files.outputDirectory,
    CONFIG.files.outputPhotosDirectory
);

const originalPhotosDir = path.join(
    CONFIG.files.inputDirectory,
    CONFIG.files.inputPhotosDirectory
);

export function GetImageFilePath(entry: DayOneEntry, photoId: string) {
    const photo = entry.photos?.find(photo => photo.identifier === photoId);

    if (photo) {
        if (!photo.md5) {
            console.warn(
                `WARNING: Missing photo file name for ID '${photo.identifier}' ('${photo.type}') on ${new Date(entry.creationDate).toLocaleString()}.`
            );
            return "";
        }

        const filename = `${photo.md5}.${RESIZED_IMAGES_EXT}`;
        const srcFilePath = path.join("..", photosDir, filename);

        const originalFilePath = path.join(
            originalPhotosDir,
            `${photo.md5}.${photo.type}`
        );
        if (!fs.existsSync(originalFilePath)) {
            console.warn(`No original path: '${originalFilePath}'`);
        }

        const pathToCheck = path.join(
            CONFIG.files.outputDirectory,
            srcFilePath
        );
        if (!fs.existsSync(pathToCheck)) {
            // console.error(photo);
            console.error(`'${pathToCheck}' doesn't exist.`);
            return "";
        }

        return srcFilePath;
    }

    console.warn(
        `No photo found in entry '${new Date(entry.creationDate).toLocaleString()}' with ID: '${photoId}'`
    );
    return "";
}

export function ProcessHtmlImages(entry: DayOneEntry, html: string) {
    return html.replace(/<img([^>]*)>/g, (match, p1) => {
        return `
<div class="entry-photo" ${divStyle}>
    <img${p1} ${imgStyle}>
</div>
        `.trim();
    });
}
