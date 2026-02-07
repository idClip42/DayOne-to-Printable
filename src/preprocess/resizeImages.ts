import CONFIG from "../../config.json";
import sharp from "sharp";
import fs from "fs";
import path from "path";

export const RESIZED_IMAGES_EXT = "jpg";

const inputPhotosFolder = path.join(
    CONFIG.files.inputDirectory,
    CONFIG.files.inputPhotosDirectory
);
const outputPhotosFolder = path.join(
    CONFIG.files.outputDirectory,
    CONFIG.files.outputPhotosDirectory
);

if (!fs.existsSync(outputPhotosFolder)) fs.mkdirSync(outputPhotosFolder);

async function resizeImage(inputPath: string, outputDir: string) {
    // Extract the base filename (no extension)
    const { name } = path.parse(inputPath);

    // Output path will always be a normalized JPEG
    const outputPath = path.join(outputDir, `${name}.jpg`);

    // Create a Sharp instance from the input image
    // `failOn: "none"` prevents Sharp from throwing on
    // minor corruption or unusual metadata
    const image = sharp(inputPath, { failOn: "none" });

    // Read metadata so we can decide whether resizing is needed
    const metadata = await image.metadata();

    /**
     * Start building a normalized processing pipeline.
     * We do this even if we don't resize, so that *every*
     * image passes through the same normalization steps.
     */
    let pipeline = image
        // Applies EXIF orientation directly to pixels
        // and removes orientation metadata afterward.
        // This is critical for print reliability.
        .rotate()

        // Forces the image into the sRGB colorspace.
        // Prevents CMYK / AdobeRGB / malformed ICC issues
        // that Chrome print often fails on.
        .toColorspace("srgb");

    // Resize only if the image exceeds the maximum width
    if ((metadata.width || 0) > CONFIG.content.images.maxWidth) {
        pipeline = pipeline.resize({
            width: CONFIG.content.images.maxWidth,

            // Prevents upscaling smaller images
            withoutEnlargement: true,
        });
    }

    // Encode as a baseline JPEG that Chrome's print
    // rasterizer is known to handle reliably
    await pipeline
        .jpeg({
            quality: 80,

            // Disable progressive JPEG encoding.
            // Chrome screen rendering handles it fine,
            // but the print pipeline can silently drop images.
            progressive: false,

            // Use full chroma resolution.
            // Avoids edge-case decoder bugs in print.
            chromaSubsampling: "4:4:4",
        })

        // Write the final normalized image to disk
        // Metadata is stripped by default (EXIF, ICC, DPI, etc.)
        .toFile(outputPath);
}

export async function ResizeImages() {
    const PERC_INTERVAL = 20;
    const files = fs.readdirSync(inputPhotosFolder);
    for (let f = 0; f < files.length; ++f) {
        const file = files[f];
        const input = path.join(inputPhotosFolder, file);

        if (f % PERC_INTERVAL === 0)
            console.log(`${Math.round((f / files.length) * 100)}%`);
        console.log(`Resizing '${file}'...`);

        await resizeImage(input, outputPhotosFolder);
    }
}
