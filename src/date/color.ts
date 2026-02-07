import config from "./color.json";

export function getDateColor(
    iso: string,
    timeZone: string,
    lightness: number
): string {
    const d = new Date(iso);
    const month = d.toLocaleDateString("en-US", {
        timeZone,
        month: "numeric",
    });

    const monthIndex = Number(month) - 1;
    if (isNaN(monthIndex) || monthIndex < 0)
        throw new Error(`Invalid month: '${month}'`);

    const hue = (config.baseHue + monthIndex * config.hueIncrement) % 360;
    return `hsl(${hue}, 70%, ${lightness * 100}%)`;
}

export function getDateColorTestData() {
    const htmlDates = config.testDates.map(dStr => {
        const d = new Date(dStr);
        return {
            date: d,
            dateText: dStr,
            color: getDateColor(d.toISOString(), "America/New_York", 0.75),
        };
    });
    return htmlDates;
}
