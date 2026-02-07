import fs from "fs";
import config from "../../config.json";
import { renderTemplate } from "../utilities/template";
import { CoverTemplateVars } from "../templates/cover.hbs";
import { GenerateCssVars } from "./internal/cssVars";
import { formatCoverDate } from "./internal/format";

const TEMPLATE_PATH = "src/templates/cover.hbs";

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
