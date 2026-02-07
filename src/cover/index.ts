import fs from "fs";
import config from "../../config.json";
import { renderTemplate } from "../utilities/template";
import { CoverTemplateVars } from "../templates/cover.hbs";
import { GenerateCssVars } from "./internal/cssVars";

const TEMPLATE_PATH = "src/templates/cover.hbs";

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
    const cssVars = GenerateCssVars(start.getFullYear());

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
