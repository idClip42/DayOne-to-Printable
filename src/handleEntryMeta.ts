import { DayOneEntry } from "../types/DayOneEntry";
import { formatDateTime } from "./dateUtilities";

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

function CreateLocationWeatherHtml(entry: DayOneEntry):string{
    const locParts = [
        entry.location?.localityName,
        entry.location?.administrativeArea,
        entry.location?.country,
    ].filter(Boolean);
    const location = locParts.join(', ');
    const weather = entry.weather?.conditionsDescription
        ? `${entry.weather.conditionsDescription}, ${celsiusToFahrenheit(entry.weather.temperatureCelsius ?? 0)}°F`
        : '';
    const metaLine = [location, weather].filter(Boolean).join(' — ');
    if (metaLine) {
        return `<p class="entry-meta"><em>${escapeHTML(metaLine)}</em></p>`;
    }
    return "";
}

export function CreateMetadataHtml(entry: DayOneEntry):string{
    const dateTimeHtml = CreateDateTimeHtml(entry);
    const locWeatherHtml = CreateLocationWeatherHtml(entry);
    return dateTimeHtml + "\n" + locWeatherHtml;
}