import { DayOneEntry } from "../../../../../../../types/DayOneEntry";
import { replaceAsync } from "../../../../../../../utilities/replaceAsync";
import { getAttachmentInfo } from "../../../attachments/info";
import { getAttachmentMarkdown } from "../../../attachments/textProcess";
import { getImageFilePath } from "../../../images";

const REGEX_DAY_ONE_MOMENT = /!\[]\(dayone-moment:(.*?)\)/g;
const FIX_IMAGE_SPACING = /(?<!\n)\n(!\[]\(dayone-moment:.*?\))/g;

export async function fillInAttachments(
    input: string,
    entry: DayOneEntry | null
): Promise<string> {
    let output = input;

    output = output.replace(FIX_IMAGE_SPACING, "\n\n$1");

    output = await replaceAsync(
        output,
        // 12: Resolve DayOne Image Attachments
        // Replaces all DayOne image links with the link
        // to the actual relevant image.
        REGEX_DAY_ONE_MOMENT,
        (_, match): Promise<string> => {
            if (!entry) return Promise.resolve("![]()");

            const attachmentInfo = getAttachmentInfo(entry, match);
            if (attachmentInfo.type === "Photo") {
                const imageFilePath = getImageFilePath(
                    entry,
                    match.replace("//", "")
                );
                if (imageFilePath)
                    return Promise.resolve(`![](${imageFilePath})`);
            }

            // If it's not an image, or we couldn't find the image,
            // default to this.
            return getAttachmentMarkdown(attachmentInfo);
        }
    );

    return output;
}
