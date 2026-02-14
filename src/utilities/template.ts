import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

export async function renderTemplate<T>(
    templatePath: string,
    data: T
): Promise<string> {
    const absolutePath = path.resolve(templatePath);
    const source = await fs.promises.readFile(absolutePath, "utf8");

    const template = Handlebars.compile(source, {
        noEscape: true, // important for CSS / raw text
        strict: true,
    });

    return template(data);
}
