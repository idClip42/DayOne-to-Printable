import config from "./config.json";

export function updateHtmlAttachments(htmlText: string): string {
    let resultString = htmlText.replace(
        new RegExp(`<p>${config.attachmentTag}`, "g"),
        // TODO: If we can make it make sense,
        // TODO: I'd really love to get any and
        // TODO: all HTML out of the codebase
        // TODO: and into the `templates` folder.
        "<p class='attachment-block'>"
    );

    if (resultString.includes(config.attachmentTag))
        throw new Error(
            `Failed to remove all instances of '${config.attachmentTag}'.`
        );

    return resultString;
}
