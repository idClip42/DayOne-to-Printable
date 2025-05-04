// First mockup: Basic Node.js + TypeScript-style DayOne JSON to DOCX exporter
// (Assumes you have the JSON file and images already exported from DayOne)

import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun } from 'docx';
import { Jimp } from "jimp";
import fs from 'fs';
import path from 'path';
import CONFIG from "./config.json";
import { marked } from 'marked';

// 1. Define the shape of a DayOne entry
interface DayOneEntry {
    creationDate: string; // ISO date string
    text: string; // Markdown-ish text with ![](dayone-moment://ID)
    location?: {
        localityName?: string;
        administrativeArea?: string;
        country?: string;
        latitude?: number;
        longitude?: number;
    };
    weather?: {
        conditionsDescription?: string;
        temperatureCelsius?: number;
    };
    photos?: {
        identifier: string;
        // filename: string;
        "md5": string,
        "type": string
    }[];
}

// 2. Load your exported JSON
const dataPath = path.join(CONFIG.INPUT_DIR, CONFIG.DATA_FILE);
const photosDir = path.join(CONFIG.INPUT_DIR, CONFIG.PHOTOS_DIR); // Directory where your images are stored
const outputPath = path.join(CONFIG.OUTPUT_DIR, CONFIG.OUTPUT_FILE);
if(!fs.existsSync(CONFIG.OUTPUT_DIR))
    fs.mkdirSync(CONFIG.OUTPUT_DIR);

const rawJson = fs.readFileSync(dataPath, 'utf-8');
const entries: DayOneEntry[] = JSON.parse(rawJson).entries;

// 3. Helper: Convert Celsius to Fahrenheit
const celsiusToFahrenheit = (c: number) => Math.round((c * 9) / 5 + 32);

// 4. Helper: Format datetime
function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

// 5. Helper: Find photo by ID
function findPhoto(entry: DayOneEntry, id: string) {
    return entry.photos?.find(photo => photo.identifier === id);
}

// 6. Main logic: Create the document (image resizing with aspect ratio preservation)
async function createDoc(entries: DayOneEntry[]) {
    const children: Paragraph[] = [];

    for (const entry of entries) {
        // --- Date/time ---
        children.push(new Paragraph({
            text: formatDateTime(entry.creationDate),
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 100 },
        }));

        // --- Location / Weather ---
        const locParts = [
            entry.location?.localityName,
            entry.location?.administrativeArea,
            entry.location?.country,
        ].filter(Boolean);

        const location = locParts.join(', ');
        const weather = entry.weather?.conditionsDescription
            ? `${entry.weather.conditionsDescription}, ${celsiusToFahrenheit(entry.weather.temperatureCelsius ?? 0)}°F`
            : '';

        const metaLine = [location, weather].filter(Boolean).join(' — ');

        if (metaLine) {
            children.push(new Paragraph({
                children: [
                    new TextRun({
                        text: metaLine,
                        italics: true,
                    }),
                ],
                spacing: { after: 300 },
            }));
        }

        // --- Text body ---
        const lines = entry.text.split('\n');
        for (let line of lines) {
            const imgMatch = line.match(/!\[]\(dayone-moment:\/\/(.*?)\)/);
            if (imgMatch) {
                const photoId = imgMatch[1];
                const photo = findPhoto(entry, photoId);

                if (photo) {
                    const photoPath = path.join(
                        photosDir,
                        `${photo.md5}.${photo.type}`
                    );
                    const imageBuffer = fs.readFileSync(photoPath);

                    // Get the image's natural dimensions (width and height)
                    const img = await Jimp.read(imageBuffer);
                    const originalWidth = img.bitmap.width;
                    const originalHeight = img.bitmap.height;

                    // Calculate the new height based on the width while preserving the aspect ratio
                    const width = 400; // Fixed width for the image
                    const height = Math.round((width / originalWidth) * originalHeight);

                    // Add the image to the document
                    children.push(new Paragraph({
                        children: [
                            new ImageRun({
                                data: new Uint8Array(imageBuffer),
                                transformation: {
                                    width: width,
                                    height: height,
                                },
                                type: "jpg",
                            }),
                        ],
                        spacing: { after: 300 },
                    }));
                }
            } else {
                // Normal text paragraph
                if (line.trim() !== '') {
                    const parsed = parseMarkdownToParagraphs(line);
                    children.push(...parsed);
                }
            }
        }

        // --- Extra spacing between entries ---
        children.push(new Paragraph({
            children: [new TextRun('')],
            spacing: { after: 800 },
        }));
    }

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: children,
            },
        ],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Exported journal to ${outputPath}`);
}

// 7. Run it!
createDoc(entries).catch(console.error);

/// ----

// Converts a markdown string into an array of Paragraphs
function parseMarkdownToParagraphs(markdown: string): Paragraph[] {
    const tokens = marked.lexer(markdown);
    const paragraphs: Paragraph[] = [];

    for (const token of tokens) {
        if (token.type === 'heading') {
            const runs = [new TextRun({ text: token.text, bold: true })];
            paragraphs.push(new Paragraph({
                children: runs,
                heading: token.depth === 1
                    ? HeadingLevel.HEADING_1
                    : token.depth === 2
                        ? HeadingLevel.HEADING_2
                        : HeadingLevel.HEADING_3,
                spacing: { after: 200 },
            }));
        } else if (token.type === 'paragraph') {
            paragraphs.push(new Paragraph({
                children: parseInlineMarkdown(token.tokens),
                spacing: { after: 200 },
            }));
        } else if (token.type === 'text') {
            paragraphs.push(new Paragraph({
                children: [new TextRun(token.text)],
                spacing: { after: 200 },
            }));
        }
    }

    return paragraphs;
}

// Handles bold/italic inside paragraphs
function parseInlineMarkdown(inlineTokens: any[]): TextRun[] {
    const runs: TextRun[] = [];

    for (const token of inlineTokens) {
        if (token.type === 'text') {
            runs.push(new TextRun(token.text));
        } else if (token.type === 'strong') {
            runs.push(new TextRun({ text: token.text, bold: true }));
        } else if (token.type === 'em') {
            runs.push(new TextRun({ text: token.text, italics: true }));
        } else if (token.type === 'codespan') {
            runs.push(new TextRun({ text: token.text, font: "Courier New" }));
        } else if (token.type === 'link') {
            runs.push(new TextRun({ text: token.text + ` (${token.href})`, style: "Hyperlink" }));
        }
    }

    return runs;
}