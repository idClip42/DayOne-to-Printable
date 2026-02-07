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
@page {
  size: ${totalWidthIn}in ${heightIn}in;
  margin: 0;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  width: ${totalWidthIn}in;
  height: ${heightIn}in;
  font-family: "Avenir", "Avenir Next", system-ui, -apple-system, "Segoe UI", sans-serif;
  background: #2b3a50;
  color: #d4d8e0;
}

#cover {
  display: grid;
  grid-template-columns: ${frontBackWidthIn}in ${spineWidthIn}in ${frontBackWidthIn}in;
  width: 100%;
  height: 100%;
}

/* Shared panel styling */
section {
  padding: 0.75in;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Back cover */
.back {
  background: #2b3a50;
}

/* Spine */
.spine {
  position: relative;
  background: #141d28;
  writing-mode: vertical-rl;
  text-align: center;
  letter-spacing: 0.04em;

  /* Bleed background outward into hinges */
  margin-left: -${hingeIn}in;
  margin-right: -${hingeIn}in;

  /* Reclaim space so text stays centered */
  padding-left: ${hingeIn}in;
  padding-right: ${hingeIn}in;
}

.spine-main {
  margin-top: auto;
  margin-bottom: auto;
}

.spine-volume {
  position: absolute;
  bottom: 0.35in;   /* deliberate, physical margin */
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  writing-mode: initial;
}

.vol-label {
  font-size: 8pt;
  letter-spacing: 0.08em;
  opacity: 0.8;
}

.vol-number {
  font-size: 18pt;
  font-weight: 600;
}

/* Front cover */
.front {
  flex-direction: column;
  text-align: center;
  justify-content: flex-start; /* move items toward the top */
  padding-top: 2in; /* adjust as needed to hit the top-third visually */
}

.year {
  font-size: 60pt;
  font-weight: 600;
  letter-spacing: 0em;
  margin-bottom: 0.2em;
}

.year-spine {
  font-size: 24pt;
  font-weight: 600;
  letter-spacing: 0em;
}

.month-spine {
  font-size: 20pt;
  letter-spacing: 0em;
}

.spine-accent {
  position: absolute;
  bottom: calc(0.35in + 1.2in); /* volume offset + volume block height */
  left: ${hingeIn};
  width: calc(100% - ${hingeIn * 2}in);
  height: 5pt;
  background: ${GetYearAccentColor(start.getFullYear())};
}

.months {
  font-size: 28pt;
  font-weight: 400;
  letter-spacing: 0.06em;
  margin-bottom: 1.2em;
}

.author {
  font-size: 16pt;
  font-weight: 400;
  letter-spacing: 0.08em;
}

.front .subtitle {
  margin-top: 0.5em;
  font-size: 14pt;
  opacity: 0.85;
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
        <div class="vol-number">${cover.content.volume.number}</div>
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
