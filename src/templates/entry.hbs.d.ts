export interface EntryTemplateVars {
    contentHtml: string;
    monthHue: number;
    weekday: string;
    monthDay: string;
    year: string;
    time: string;
    amPm: string;
    weather: string;
    tempF: number | undefined;
    location: string;
    tagHtmls: string[];
    isNewDay: boolean;
}
