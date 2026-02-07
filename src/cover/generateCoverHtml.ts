import fs from "fs";
import config from "../../config.json";
import { NumberToHue } from "../utilities/color";

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

    const stylesheet = fs.readFileSync(config.files.stylesheets.cover);

    const { totalWidthIn, heightIn, spineWidthIn, hingeIn } = cover.dimensions;

    const frontBackWidthIn = (totalWidthIn - spineWidthIn) / 2;

    const { yearLine, monthLine } = formatCoverDate(start, end);

    const subtitle = cover.content.subtitle;
    const author = "Alex Earley";

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Journal Cover</title>

<style>
${stylesheet}

@page {
  size: ${totalWidthIn}in ${heightIn}in;
}

body {
  width: ${totalWidthIn}in;
  height: ${heightIn}in;
}

#cover {
  grid-template-columns: ${frontBackWidthIn}in ${spineWidthIn}in ${frontBackWidthIn}in;
}

.spine {
  /* Bleed background outward into hinges */
  margin-left: -${hingeIn}in;
  margin-right: -${hingeIn}in;

  /* Reclaim space so text stays centered */
  padding-left: ${hingeIn}in;
  padding-right: ${hingeIn}in;
}

.spine-accent {
  left: ${hingeIn};
  width: calc(100% - ${hingeIn * 2}in);
  background: ${GetYearAccentColor(start.getFullYear())};
}
</style>
</head>

<body>
  <div id="cover">
    <section class="back">
      <!-- intentionally blank for now -->
    </section>

    <section class="spine">
      <div class="spine-main">
        <span class="year-spine">${yearLine}</span>
        <span class="month-spine">: ${monthLine}</span>
      </div>

      <div class="spine-accent"></div>

      <div class="spine-volume">
        <div class="vol-label">VOL.</div>
        <div class="vol-number">${cover.content.volume}</div>
      </div>
  </section>

    <section class="front">
      <div class="year">${yearLine}</div>
      <div class="months">${monthLine}</div>
      <div class="author">${author}</div>
      ${Boolean(cover.content.subtitle) ? `<div class="subtitle">${subtitle}</div>` : ""}
    </section>
  </div>
</body>
</html>`;
}
