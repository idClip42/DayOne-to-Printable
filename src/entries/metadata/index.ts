import { DayOneEntry } from "../../../types/DayOneEntry";
import {
    formatDate,
    formatDateTime,
    GetDateColor,
    GetDayOfWeek,
} from "../../dateUtilities";
import { GetTagHtml } from "../../organizeTags";
import CONFIG from "../../../config.json";

function celsiusToFahrenheit(c: number) {
    return Math.round((c * 9) / 5 + 32);
}

function CreateDateHtml(entry: DayOneEntry): string {
    const formattedDateTime = formatDate(
        entry.creationDate,
        entry.location?.timeZoneName,
        true
    );
    return formattedDateTime;
}

function CreateDateTimeHtml(entry: DayOneEntry): string {
    const formattedDateTime = formatDateTime(
        entry.creationDate,
        entry.location?.timeZoneName
    );
    return formattedDateTime;
}

function CreateDayOfWeekHtml(entry: DayOneEntry): string {
    const weekday = GetDayOfWeek(
        entry.creationDate,
        entry.location?.timeZoneName
    );
    return weekday;
}

function GetLocationString(entry: DayOneEntry): string {
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

function GetWeatherString(entry: DayOneEntry): string {
    if (!entry.weather?.conditionsDescription) return "";
    const fTemp = celsiusToFahrenheit(entry.weather.temperatureCelsius ?? 0);
    return `${entry.weather.conditionsDescription}, ${fTemp}°F`;
}

function CreateTagsHtml(entry: DayOneEntry): string {
    if (!entry.tags || entry.tags.length === 0) return "";
    const tagsList = entry.tags.map(GetTagHtml).join(" ");
    return `
<p class="entry-tags">
    Tags: ${tagsList}
</p>
    `.trim();
}

export function CreateMetadataHtml(entry: DayOneEntry): string {
    const monthColor = GetDateColor(
        entry.creationDate,
        entry.location?.timeZoneName,
        0.75
    );
    const style = `background: linear-gradient(to bottom, ${monthColor}, #ffffff)`;

    return `
<div class="entry-metadata" style="${style}">
    <p class="pre-date-time">
        <span class="entry-weekday">${CreateDayOfWeekHtml(entry)}</span>
        <span class="entry-weather">${GetWeatherString(entry)}</span>
    </p>

    <h2 class="entry-date">
        ${CreateDateTimeHtml(entry)}
    </h2>

    <div class="hidden-date">
        ${CreateDateHtml(entry)}
    </div>

    <p class="post-date-time">
        <span class="entry-location">${GetLocationString(entry)}</span>
    </p>

    ${CreateTagsHtml(entry)}
</div>
    `.trim();
}
