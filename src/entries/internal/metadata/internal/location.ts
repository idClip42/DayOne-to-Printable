import { DayOneEntry } from "../../../../types/DayOneEntry";
import CONFIG from "../../../../../config.json";

export function GetLocationString(entry: DayOneEntry): string {
    const locParts = [
        entry.location?.placeName,
        entry.location?.localityName,
        entry.location?.administrativeArea,
        entry.location?.country ===
        CONFIG.ENTRIES.METADATA.LOCATIONS.SKIP_COUNTRY
            ? undefined
            : entry.location?.country,
    ].filter(Boolean);
    return locParts.join(", ");
}
