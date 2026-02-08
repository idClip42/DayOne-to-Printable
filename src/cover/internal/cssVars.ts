import config from "../../../config.json";
import { numberToHue } from "../../utilities/color";

function getYearAccentColor(year: number): string {
    /** cool-blue starting point */
    const YEAR_ACCENT_START = 210;
    const hue = numberToHue(year, YEAR_ACCENT_START);
    // TODO: Move the hsl string down.
    return `hsl(${hue}, 70%, 55%)`;
}

export function generateCssVars(year: number) {
    const dimensions = config.cover.dimensions;
    const accentColor = getYearAccentColor(year);

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
