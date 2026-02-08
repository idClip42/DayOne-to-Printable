import config from "../../../config.json";
import { numberToHue } from "../../utilities/color";

export function generateCssVars(year: number) {
    const dimensions = config.cover.dimensions;

    /** cool-blue starting point */
    const YEAR_ACCENT_START = 210;
    const hue = numberToHue(year, YEAR_ACCENT_START);

    return `
:root {
  --total-width: ${dimensions.totalWidthIn}in;
  --height: ${dimensions.heightIn}in;
  --spine-width: ${dimensions.spineWidthIn}in;
  --hinge-in: ${dimensions.hingeIn}in;
  --spine-accent-hue: ${hue};
}
    `.trim();
}
