import { DayOneEntry } from "../../../types/DayOneEntry";

const SKIP_COUNTRY = "United States";

export function GetLocationString(entry: DayOneEntry): string {
    const locParts = [
        entry.location?.placeName,
        entry.location?.localityName,
        entry.location?.administrativeArea,
        entry.location?.country === SKIP_COUNTRY
            ? undefined
            : entry.location?.country,
    ].filter(Boolean);
    return locParts.join(", ");
}
