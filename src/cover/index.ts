import fs from "fs";
import config from "../../config.json";
import { NumberToHue } from "../utilities/color";
import { renderTemplate } from "../utilities/template";
import { CoverTemplateVars } from "../templates/cover.hbs";

const TEMPLATE_PATH = "src/templates/cover.hbs";

function GetYearAccentColor(year: number): string {
    /** cool-blue starting point */
    const YEAR_ACCENT_START = 210;
    const hue = NumberToHue(year, YEAR_ACCENT_START);
    return `hsl(${hue}, 70%, 55%)`;
}

function formatCoverDate(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const sameYear = start.getFullYear() === end.getFullYear();

    const monthFormatter = new Intl.DateTimeFormat("en-US", {
        month: "long",
    });

    const startMonth = monthFormatter.format(start);
    const endMonth = monthFormatter.format(end);

    return {
        yearLine: sameYear
            ? String(start.getFullYear())
            : `${start.getFullYear()}–${end.getFullYear()}`,

        monthLine: sameYear
            ? `${startMonth} – ${endMonth}`
            : `${startMonth} ${start.getFullYear()} – ${endMonth} ${end.getFullYear()}`,
    };
}

interface CoverDates {
    start: Date;
    end: Date;
}

export function generateCoverHtml({ start, end }: CoverDates): string {
    const cover = config.cover;
    const stylesheet = fs.readFileSync(config.files.stylesheets.cover, "utf8");
    const { yearLine, monthLine } = formatCoverDate(start, end);
    const accentColor = GetYearAccentColor(start.getFullYear());

    const cssVars = `
:root {
  --total-width: ${cover.dimensions.totalWidthIn}in;
  --height: ${cover.dimensions.heightIn}in;
  --spine-width: ${cover.dimensions.spineWidthIn}in;
  --hinge-in: ${cover.dimensions.hingeIn}in;
  --spine-accent-color: ${accentColor};
}
    `.trim();

    return renderTemplate<CoverTemplateVars>(TEMPLATE_PATH, {
        css: {
            vars: cssVars,
            style: stylesheet,
        },
        yearText: yearLine,
        monthText: monthLine,
        volumeNumber: cover.content.volume,
        author: cover.content.author,
        subtitle: cover.content.subtitle,
    });
}
