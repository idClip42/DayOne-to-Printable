import { DayOneEntry } from "../../../../../types/DayOneEntry";

function celsiusToFahrenheit(c: number) {
    return Math.round((c * 9) / 5 + 32);
}

export function GetWeatherString(entry: DayOneEntry): string {
    if (!entry.weather?.conditionsDescription) return "";
    const fTemp = celsiusToFahrenheit(entry.weather.temperatureCelsius ?? 0);
    return `${entry.weather.conditionsDescription}, ${fTemp}°F`;
}
