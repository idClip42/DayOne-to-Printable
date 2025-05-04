/**
 * Define the shape of a DayOne entry
 */
export interface DayOneEntry {
    creationDate: string; // ISO date string
    text: string; // Markdown-ish text with ![](dayone-moment://ID)
    location?: {
        localityName?: string;
        administrativeArea?: string;
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
        "md5": string;
        "type": string;
    }[];
}
