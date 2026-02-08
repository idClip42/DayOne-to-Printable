type TableDatum = {
    label: string;
    value: string;
};

export interface InteriorTemplateVars {
    style: string;
    colorTestDates: {
        date: string;
        hue: number;
    }[];
    stats: TableDatum[];
    tagStats: TableDatum[];
    entriesHtml: string[];
}
