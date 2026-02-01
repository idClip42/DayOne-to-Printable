/**
 * Define the shape of a DayOne entry
 */
export interface DayOneEntry {
    creationDate: string; // ISO date string
    text: string; // Markdown-ish text with ![](dayone-moment://ID)
    richText: string; // JSON-stringified rich-text object
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
        "md5"?: string;
        /** This is the stored photo type */
        "type": string;
        date: string;
        /** Original filename, if available */
        "filename"?: string
    }[];
    audios?: {
        "title": string,
        "duration": number,
        "format": string,
        "identifier": string,
        "md5": string
    }[];
    videos?: {
        "type" : string,
        "identifier" : string,
        "md5": string,
        "duration": number
    }[];
    pdfAttachments?: {
      "type" : string,
      "identifier" : string,
      "md5" : string,
      "pdfName" : string
    }[];
    tags?: string[];
    isAllDay : boolean;
}
