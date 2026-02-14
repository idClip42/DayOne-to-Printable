import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

const cache: { [key: string]: ReturnType<(typeof Handlebars)["compile"]> } = {};

export async function renderTemplate<T>(
    templatePath: string,
    data: T
): Promise<string> {
    let template = cache[templatePath];
    if (!template) {
        const absolutePath = path.resolve(templatePath);
        const source = await fs.promises.readFile(absolutePath, "utf8");
        template = Handlebars.compile(source, {
            noEscape: true, // important for CSS / raw text
            strict: true,
        });
        cache[absolutePath] = template;
    }
    return template(data);
}
