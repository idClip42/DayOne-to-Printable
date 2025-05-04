/**
 * Define the shape of a DayOne entry
 */
export interface DayOneEntry {
    creationDate: string; // ISO date string
    text: string; // Markdown-ish text with ![](dayone-moment://ID)
    location?: {
        placeName?: string;
        localityName?: string;
        administrativeArea?: string;
        timeZoneName?: string;
        country?: string;
        latitude?: number;
        longitude?: number;
    };
    weather?: {
        conditionsDescription?: string;
        temperatureCelsius?: number;
    };
    photos?: {
        identifier: string;
        // filename: string;
        /** This is the stored photo name */
        "md5": string;
        /** This is the stored photo type */
        "type": string;
    }[];
    tags?: string[];
}
