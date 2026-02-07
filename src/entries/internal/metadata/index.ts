import { DayOneEntry } from "../../../../types/DayOneEntry";
import { GetDateColor } from "../../../date/color";
import { GetTagHtml } from "../../../tags";
import { GetWeatherString } from "./internal/weather";
import { GetLocationString } from "./internal/location";
import {
    CreateDateHtml,
    CreateDateTimeHtml,
    CreateDayOfWeekHtml,
} from "./internal/dateTime";

// This should probably just be built into the HTML template.
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
