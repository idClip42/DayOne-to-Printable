import { DayOneEntry } from "../../../types/DayOneEntry";

function celsiusToFahrenheit(tempC: number | undefined): number | undefined {
    if (tempC === undefined) return undefined;
    return Math.round((tempC * 9) / 5 + 32);
}

export function getWeather(entry: DayOneEntry) {
    return {
        weather: entry.weather?.conditionsDescription || "",
        tempF: celsiusToFahrenheit(entry.weather?.temperatureCelsius),
    };
}
