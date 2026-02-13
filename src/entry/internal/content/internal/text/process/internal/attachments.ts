import { DayOneEntry } from "../../../../../../../types/DayOneEntry";
import { getAttachmentInfo } from "../../../attachments/info";
import { getAttachmentMarkdown } from "../../../attachments/textProcess";
import { getImageFilePath } from "../../../images";

// TODO: We need to be able to test this.
// TODO: All our tests are image-less.
// TODO: We need image examples, and we need
// TODO: missing media examples.

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
