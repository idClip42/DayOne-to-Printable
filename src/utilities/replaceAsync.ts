export async function replaceAsync(
    input: string,
    regex: RegExp,
    replacer: (...args: any[]) => Promise<string>
): Promise<string> {
    if (!regex.global) {
        throw new Error("replaceAsync requires a global RegExp");
    }

    const matches = Array.from(input.matchAll(regex));

    const replacements = await Promise.all(
        matches.map(match => replacer(...match))
    );

    let i = 0;
    return input.replace(regex, () => replacements[i++]);
}
