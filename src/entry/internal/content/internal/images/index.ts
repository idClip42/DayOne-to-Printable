import { DayOneEntry } from "../../../../../types/DayOneEntry";
import config from "../../../../../../config.json";
import path from "path";
import { RESIZED_IMAGES_EXT } from "../../../../../preprocess/resizeImages";
import fs from "fs";
import { renderTemplate } from "../../../../../utilities/template";
import { ImageTemplateVars } from "../../../../../templates/image.hbs";
import { replaceAsync } from "../../../../../utilities/replaceAsync";
import chalk from "chalk";

const TEMPLATE_PATH = "src/templates/image.hbs";
const REGEX_IMG_TAG = /<img([^>]*)>/g;

/** Directory where your images are stored */
const photosDir = path.join(
    config.files.output.directory,
    config.files.output.photosDirectory
);

const originalPhotosDir = path.join(
    config.files.input.directory,
    config.files.input.photosDirectory
);

export function getImageFilePath(entry: DayOneEntry, photoId: string) {
    const photo = entry.photos?.find(photo => photo.identifier === photoId);

    if (photo) {
        if (!photo.md5) {
            console.warn(
                chalk.yellow(
                    `${new Date(entry.creationDate).toLocaleString()}: Missing photo file name for ID '${photo.identifier}' ('${photo.type}').`
                )
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
            console.warn(
                chalk.yellow(
                    `${new Date(entry.creationDate).toLocaleString()}: No original path: '${originalFilePath}'`
                )
            );
        }

        const pathToCheck = path.join(
            config.files.output.directory,
            srcFilePath
        );
        if (!fs.existsSync(pathToCheck)) {
            console.warn(
                chalk.yellow(
                    `${new Date(entry.creationDate).toLocaleString()}: '${pathToCheck}' doesn't exist.`
                )
            );
            return "";
        }

        return srcFilePath;
    }

    console.warn(
        chalk.yellow(
            `${new Date(entry.creationDate).toLocaleString()}: No photo found with ID: '${photoId}'`
        )
    );
    return "";
}

export function processHtmlImages(entry: DayOneEntry, html: string) {
    return replaceAsync(html, REGEX_IMG_TAG, (match, p1) => {
        return renderTemplate<ImageTemplateVars>(TEMPLATE_PATH, {
            imgAttributes: p1,
            obfuscate: config.content.obfuscate,
        });
    });
}
