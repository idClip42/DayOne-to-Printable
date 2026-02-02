import config from "../config.json";
import { GetYearAccentColor } from "./dateUtilities";

function formatCoverDate(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const sameYear = start.getFullYear() === end.getFullYear();

    const monthFormatter = new Intl.DateTimeFormat("en-US", {
        month: "long"
    });

    const startMonth = monthFormatter.format(start);
    const endMonth = monthFormatter.format(end);

    return {
        yearLine: sameYear
            ? String(start.getFullYear())
            : `${start.getFullYear()}–${end.getFullYear()}`,

        monthLine: sameYear
            ? `${startMonth} – ${endMonth}`
            : `${startMonth} ${start.getFullYear()} – ${endMonth} ${end.getFullYear()}`
    };
}

interface CoverDates {
    start: Date;
    end: Date;
}

export function generateCoverHtml({ start, end }: CoverDates): string {
    const cover = config.cover;

    const {
      totalWidthIn,
      heightIn,
      spineWidthIn,
      hingeIn
    } = cover.dimensions;

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
  font-family: ${cover.typography.fontFamily};
  background: ${cover.colors.background};
  color: ${cover.colors.text};
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
  background: ${cover.colors.background};
}

/* Spine */
.spine {
  position: relative;
  background: ${cover.colors.accent};
  writing-mode: vertical-rl;
  text-align: center;
  letter-spacing: ${cover.typography.letterSpacingEm}em;

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
  margin-top: auto;
  padding-bottom: 0.25in;
  text-align: center;
  writing-mode: initial;
}

.vol-label {
  font-size: ${cover.typography.spineVolumeTypography.labelSizePt}pt;
  letter-spacing: ${cover.typography.spineVolumeTypography.letterSpacingEm}em;
  opacity: 0.8;
}

.vol-number {
  font-size: ${cover.typography.spineVolumeTypography.numberSizePt}pt;
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
  font-size: ${cover.typography.dateTypography.year.fontSize};
  font-weight: ${cover.typography.dateTypography.year.fontWeight};
  letter-spacing: ${cover.typography.dateTypography.year.letterSpacing};
  margin-bottom: ${cover.typography.dateTypography.year.marginBottom};
}

.year-spine {
  font-size: ${cover.typography.spineSize.yearPt}pt;
  font-weight: ${cover.typography.dateTypography.year.fontWeight};
  letter-spacing: ${cover.typography.dateTypography.year.letterSpacing};
}

.month-spine {
  font-size: ${cover.typography.spineSize.monthsPt}pt;
  letter-spacing: ${cover.typography.dateTypography.year.letterSpacing};
}

.spine-accent {
  position: absolute;
  bottom: 2in;
  left: 0;
  width: 100%;
  height: 3pt;
  background: ${GetYearAccentColor(start.getFullYear())};
}

.months {
  font-size: ${cover.typography.dateTypography.months.fontSize};
  font-weight: ${cover.typography.dateTypography.months.fontWeight};
  letter-spacing: ${cover.typography.dateTypography.months.letterSpacing};
  margin-bottom: ${cover.typography.dateTypography.months.marginBottom};
}

.author {
  font-size: ${cover.typography.authorTypography.fontSize};
  font-weight: ${cover.typography.authorTypography.fontWeight};
  letter-spacing: ${cover.typography.authorTypography.letterSpacing};
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
      ${cover.content.showSubtitle ? `<div class="subtitle">${subtitle}</div>` : ""}
    </section>
  </div>
</body>
</html>`;
}
