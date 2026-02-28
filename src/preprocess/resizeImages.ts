import config from "../../config.json";
import sharp from "sharp";
import fs from "fs";
import path from "path";

export const RESIZED_IMAGES_EXT = "jpg";

const inputPhotosFolder = path.join(
    config.files.input.directory,
    config.files.input.photosDirectory
);
const outputPhotosFolder = path.join(
    config.files.output.directory,
    config.files.output.photosDirectory
);

if (!fs.existsSync(outputPhotosFolder))
    fs.mkdirSync(outputPhotosFolder, { recursive: true });

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
    if ((metadata.width || 0) > config.content.images.maxWidth) {
        pipeline = pipeline.resize({
            width: config.content.images.maxWidth,

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

export async function resizeImages() {
    // Time stats:
    // Runtime before making everything async: 207s.
    // Runtime after: 72s. 60s.

    const PERC_INTERVAL = 20;
    const startTime = Date.now();
    const files = await fs.promises.readdir(inputPhotosFolder);

    console.log(`Resizing ${files.length} files...`);
    let resizedFileCount = 0;

    const filePromises = files.map<Promise<void>>(file => {
        const input = path.join(inputPhotosFolder, file);
        return resizeImage(input, outputPhotosFolder)
            .then(() => {
                resizedFileCount++;
                if (resizedFileCount % PERC_INTERVAL === 0) {
                    const currTime = Date.now();
                    console.log(
                        `${Math.round((resizedFileCount / files.length) * 100)}% ` +
                            `(${resizedFileCount}/${files.length} files resized) ` +
                            `(${Math.round((currTime - startTime) / 1000)}s)`
                    );
                }
            })
            .catch(e =>
                console.error(`Failed to resize file '${file}': ${e.message}`)
            );
    });

    await Promise.all(filePromises).then(() => {
        const endTime = Date.now();
        console.log(
            `All images resized in ${Math.round((endTime - startTime) / 1000)}s`
        );
    });
}
