import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

type CompiledTemplate = ReturnType<(typeof Handlebars)["compile"]>;

const cache: {
    [key: string]: Promise<CompiledTemplate>;
} = {};

export async function renderTemplate<T>(
    templatePath: string,
    data: T
): Promise<string> {
    let templatePromise = cache[templatePath];
    if (!templatePromise) {
        templatePromise = fs.promises
            .readFile(path.resolve(templatePath), "utf8")
            .then(source =>
                Handlebars.compile(source, {
                    noEscape: true, // important for CSS / raw text
                    strict: true,
                })
            );
        cache[templatePath] = templatePromise;
    }
    const template = await templatePromise;
    return template(data);
}
