import config from "./config.json";

export function UpdateHtmlAttachments(htmlText: string): string {
    let resultString = htmlText.replace(
        new RegExp(`<p>${config.attachmentTag}`, "g"),
        "<p class='attachment-block'>"
    );

    if (resultString.includes(config.attachmentTag))
        throw new Error(
            `Failed to remove all instances of '${config.attachmentTag}'.`
        );

    return resultString;
}
