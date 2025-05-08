import { marked } from "marked";
import { DayOneEntry } from "../types/DayOneEntry";
import { CreateImageHtml, ImageTokenMatch, ImageTokenSplit } from "./handleEntryContentImage";
import CONFIG from "./../config.json";

let loremIpsumPosition = 0;

function preprocessEntryText(text: string): string {
    // Trim leading/trailing whitespace
    const trimmed = text.trim();

    // Find first line break
    const firstNewlineIndex = trimmed.indexOf('\n');
    const firstLine = firstNewlineIndex === -1 ? trimmed : trimmed.slice(0, firstNewlineIndex);

    // If the first line doesn't start with a markdown header but is short enough, prepend "# "
    if (!firstLine.startsWith('#') && firstLine.length <= 100) {
        return `# ${trimmed}`;
    }

    return trimmed;
}

export function CreateContentHtml(entry:DayOneEntry):string{
    let htmlResult = "";

    const preprocessedText = preprocessEntryText(entry.text);
    const paragraphs = preprocessedText.split(/\n{2,}/);

    for(let p = 0; p < paragraphs.length; ++p) {
        let paragraph = paragraphs[p];
        // Replace single returns after blockquotes ("> TEXT\n") with a double return for separation
        paragraph = paragraph.replace(/>[^>].*\n(?!>)/g, match => match + '\n');
    
        // Break paragraph into segments: either image matches or plain text
        const tokens = paragraph.split(ImageTokenSplit);
        for(let t = 0; t < tokens.length; ++t) {
            const token = tokens[t];
            const imgMatch = token.match(ImageTokenMatch);
            if (imgMatch) {
                htmlResult += CreateImageHtml(entry, imgMatch[1]);
            } else if (token.trim()) {
                // Replace single newlines (no newline before or after them) with <br> and parse with marked
                const BREAK = '<br>\n';
                const withBreaks = token.replace(/(?<!\n)\n(?!\n)/g, BREAK);
                if(CONFIG.LOREM_IPSUM_MODE){
                    htmlResult += marked.parse(
                        withBreaks.split(BREAK).map((text, textIndex)=>{
                            const localLoremIpsum = LOREM_IPSUM.substring(loremIpsumPosition) + LOREM_IPSUM.substring(0, loremIpsumPosition);
                            if(text.length > localLoremIpsum.length)
                                return localLoremIpsum;
                            let result = localLoremIpsum.substring(0, text.length);
                            loremIpsumPosition = (loremIpsumPosition + text.length) % LOREM_IPSUM.length;
                            if(p === 0 && t === 0 && textIndex === 0)
                                result = `# ${result}`; 
                            return result.trim();
                        }).join(BREAK).trim()
                    );
                }
                else {
                    htmlResult += marked.parse(withBreaks);
                }
            }
        }
    }
    
    return htmlResult;
}

const LOREM_IPSUM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque augue est, molestie suscipit diam vel, pellentesque lacinia nunc. In hac habitasse platea dictumst. Quisque ac eros mi. Suspendisse ac libero placerat, lobortis dui ut, sagittis nisi. Aliquam ac semper elit, vitae vehicula nibh. Mauris ut tristique massa. Nullam id eleifend ante, a finibus odio. Aenean urna sapien, mollis vel aliquet ac, euismod non orci. Nunc ullamcorper dui et magna imperdiet, in laoreet enim luctus. Aliquam tincidunt risus in sapien vulputate, vitae molestie nulla sagittis. Vivamus congue consequat massa. Nam blandit cursus magna a vestibulum. Aliquam luctus arcu leo, eu tempor sapien tincidunt at. Phasellus tincidunt magna tincidunt libero pharetra lacinia. Mauris tempus ipsum eget felis scelerisque mattis. Ut at rhoncus dolor, sed ultrices tellus. Fusce vel tempus dui. Fusce egestas tristique urna, nec lacinia neque egestas nec. Donec laoreet nunc nibh, eget lacinia purus ornare non. Integer quis ligula et diam porttitor hendrerit. Donec tincidunt ipsum nisi, non fermentum ipsum eleifend id. Phasellus rhoncus quam erat, quis porta orci malesuada ut. Quisque nec pellentesque ligula, sed euismod nunc. Nulla ut eleifend justo. Suspendisse potenti. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc pellentesque, lorem at laoreet pellentesque, ipsum nunc auctor augue, id semper felis elit sit amet risus. Aliquam erat volutpat. Fusce consequat metus nunc, quis suscipit sapien ornare eu. Ut justo augue, vestibulum at tempus vitae, semper sed massa. In quis feugiat velit, et egestas sem. Suspendisse id lectus aliquam, scelerisque nisi et, tristique erat. Curabitur convallis augue id ante pharetra, viverra porttitor enim posuere. Aliquam tortor nunc, gravida non porttitor sit amet, sodales at dolor. Nam viverra lorem id arcu egestas fermentum. Proin purus felis, pharetra sit amet aliquam finibus, dignissim vel urna. ";