import config from "../config.json";

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
  background: ${cover.colors.accent};
  writing-mode: vertical-rl;
  /* transform: rotate(180deg); */ /* Rotated the wrong way */
  text-align: center;
  font-size: ${cover.typography.spineSizePt}pt;
  letter-spacing: ${cover.typography.letterSpacingEm}em;
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
    font-weight: ${cover.typography.dateTypography.year.fontWeight};
    letter-spacing: ${cover.typography.dateTypography.year.letterSpacing};
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
      <div>
        <span class="year-spine">${yearLine}</span>
        :
        ${monthLine}
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
