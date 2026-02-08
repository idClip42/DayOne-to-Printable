export interface EntryTemplateVars {
    contentHtml: string;
    monthColor: string;
    weekday: string;
    monthDay: string;
    year: string;
    time: string;
    amPm: string;
    weather: string;
    tempF: number | undefined;
    location: string;
    tagHtmls: string[];
}
