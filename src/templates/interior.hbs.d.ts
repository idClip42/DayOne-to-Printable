type TableDatum = {
    label: string;
    value: string;
};

export interface InteriorTemplateVars {
    style: string;
    colorTestDates: {
        color: string;
        date: string;
    }[];
    stats: TableDatum[];
    tagStats: TableDatum[];
    entriesHtml: string[];
}
