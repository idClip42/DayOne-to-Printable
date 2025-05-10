import { DayOneEntry } from "../types/DayOneEntry";
import { formatDateTime, GetDayOfWeek } from "./dateUtilities";
import { GetTagHtml } from "./organizeTags";
import CONFIG from "./../config.json";

function celsiusToFahrenheit(c: number) {
    return Math.round((c * 9) / 5 + 32);
}

function escapeHTML(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function CreateDateTimeHtml(entry: DayOneEntry):string{
    const formattedDateTime = formatDateTime(
        entry.creationDate, 
        entry.location.timeZoneName
    );

    return `
<h2 class="entry-date">
    ${formattedDateTime}
</h2>
    `.trim();
}

function CreateDayOfWeekHtml(entry: DayOneEntry):string {
    const weekday = GetDayOfWeek(
        entry.creationDate, 
        entry.location.timeZoneName
    );

    return `
<p class="entry-weekday">
    ${weekday}
</p>
    `.trim();
}

function GetLocationString(entry: DayOneEntry):string{
    const locParts = [
        entry.location?.placeName,
        entry.location?.localityName,
        entry.location?.administrativeArea,
        (entry.location?.country === CONFIG.ENTRIES.METADATA.LOCATIONS.SKIP_COUNTRY) ? 
            undefined : 
            entry.location?.country,
    ].filter(Boolean);
    return locParts.join(', ');
}

function GetWeatherString(entry: DayOneEntry):string{
    if(!entry.weather?.conditionsDescription) return "";
    const fTemp = celsiusToFahrenheit(entry.weather.temperatureCelsius ?? 0);
    return `${entry.weather.conditionsDescription}, ${fTemp}°F`;

}

function GetLatLonString(entry: DayOneEntry):string{
    const lat = entry.location?.latitude;
    const lon = entry.location?.longitude;
    if(lat === undefined) return "";
    if(lon === undefined) return "";

    const ns = lat >= 0 ? 'N' : 'S';
    const ew = lon >= 0 ? 'E' : 'W';
    return `(${Math.abs(lat).toFixed(4)}°${ns}, ${Math.abs(lon).toFixed(4)}°${ew})`;
}

function CreateLocationWeatherHtml(entry: DayOneEntry):string{
    const location = GetLocationString(entry);
    const weather = GetWeatherString(entry);
    const latLon = CONFIG.ENTRIES.METADATA.LOCATIONS.INCLUDE_COORDINATES ? GetLatLonString(entry) : "";

    const metaLine = [
        (location + " " + latLon).trim(), 
        weather
    ].filter(Boolean).map(
        text => escapeHTML(text)
    ).join(' — ');

    if (metaLine) {
        return `
<p class="entry-location">
    ${metaLine}
</p>
        `.trim();
    }
    return "";
}

function CreateTagsHtml(entry: DayOneEntry):string {
    if(!entry.tags || entry.tags.length === 0)
        return "";
    const tagsList = entry.tags.map(GetTagHtml).join(" ");
    return `
<p class="entry-tags">
    Tags: ${tagsList}
</p>
    `.trim();
}

export function CreateMetadataHtml(entry: DayOneEntry):string{
    const parts = [
        CreateDayOfWeekHtml(entry),
        CreateDateTimeHtml(entry),
        CreateLocationWeatherHtml(entry),
        CreateTagsHtml(entry)
    ].filter(Boolean);
    return parts.join("\n");
}