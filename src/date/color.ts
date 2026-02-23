import config from "./color.json";

export function getDateHue(date: Date, timeZone: string): number {
    const month = date.toLocaleDateString("en-US", {
        timeZone,
        month: "numeric",
    });

    const monthIndex = Number(month) - 1;
    if (isNaN(monthIndex) || monthIndex < 0)
        throw new Error(`Invalid month: '${month}'`);

    const hue = (config.baseHue + monthIndex * config.hueIncrement + 360) % 360;

    return hue;
}

export function getDateColorTestData() {
    const htmlDates = config.testDates.map(dStr => {
        const date = new Date(dStr);
        return {
            date: date,
            dateText: dStr,
            hue: getDateHue(date, "America/New_York"),
        };
    });
    return htmlDates;
}
