import CONFIG from "./../config.json";import sharp from "sharp";
import fs from "fs";
import path from "path";

export const RESIZED_IMAGES_EXT = "jpg";

const inputPhotosFolder = path.join(CONFIG.FILES.INPUT_DIR, CONFIG.FILES.PHOTOS_DIR);
const outputPhotosFolder = path.join(CONFIG.FILES.OUTPUT_DIR, CONFIG.FILES.PHOTOS_DIR);

if(!fs.existsSync(outputPhotosFolder))
    fs.mkdirSync(outputPhotosFolder);

async function resizeImage(inputPath: string, outputDir: string) {
    const { name } = path.parse(inputPath);
    const outputPath = path.join(outputDir, `${name}.jpg`);

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    if ((metadata.width || 0) > CONFIG.ENTRIES.IMAGES.MAX_WIDTH) {
        await image
            .resize({ width: CONFIG.ENTRIES.IMAGES.MAX_WIDTH })
            .jpeg({ quality: 80 }) // adjust quality if desired
            .toFile(outputPath);
    } else {
        fs.copyFileSync(inputPath, outputPath); // no need to resize
    }
}

export async function ResizeImages(){
    for (const file of fs.readdirSync(inputPhotosFolder)) {
        const input = path.join(inputPhotosFolder, file);
        console.log(`Resizing '${file}'...`);
        await resizeImage(input, outputPhotosFolder);
    }
}