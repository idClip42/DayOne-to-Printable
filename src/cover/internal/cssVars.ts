import config from "../../../config.json";
import { NumberToHue } from "../../utilities/color";

function GetYearAccentColor(year: number): string {
    /** cool-blue starting point */
    const YEAR_ACCENT_START = 210;
    const hue = NumberToHue(year, YEAR_ACCENT_START);
    return `hsl(${hue}, 70%, 55%)`;
}

export function GenerateCssVars(year: number) {
    const dimensions = config.cover.dimensions;
    const accentColor = GetYearAccentColor(year);

    return `
:root {
  --total-width: ${dimensions.totalWidthIn}in;
  --height: ${dimensions.heightIn}in;
  --spine-width: ${dimensions.spineWidthIn}in;
  --hinge-in: ${dimensions.hingeIn}in;
  --spine-accent-color: ${accentColor};
}
    `.trim();
}
