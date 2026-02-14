import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

export function renderTemplate<T>(templatePath: string, data: T): string {
    const absolutePath = path.resolve(templatePath);
    // TODO: Make async
    const source = fs.readFileSync(absolutePath, "utf8");

    const template = Handlebars.compile(source, {
        noEscape: true, // important for CSS / raw text
        strict: true,
    });

    return template(data);
}
