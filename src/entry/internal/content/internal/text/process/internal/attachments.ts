import { DayOneEntry } from "../../../../../../../types/DayOneEntry";
import { getAttachmentInfo } from "../../../attachments/info";
import { getAttachmentMarkdown } from "../../../attachments/textProcess";
import { getImageFilePath } from "../../../images";

export function fillInAttachments(
    input: string,
    entry: DayOneEntry | null
): string {
    return input.replace(
        // 12: Resolve DayOne Image Attachments
        // Replaces all DayOne image links with the link
        // to the actual relevant image.
        /!\[]\(dayone-moment:(.*?)\)/g,
        (_, match) => {
            if (!entry) return "![]()";

            const attachmentInfo = getAttachmentInfo(entry, match);
            if (attachmentInfo.type === "Photo") {
                const imageFilePath = getImageFilePath(
                    entry,
                    match.replace("//", "")
                );
                if (imageFilePath) return `![](${imageFilePath})`;
            }

            // If it's not an image, or we couldn't find the image,
            // default to this.
            return getAttachmentMarkdown(attachmentInfo);
        }
    );
}
