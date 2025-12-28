import { format } from "date-fns";
import config from "../config.json";

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

    const dateRange = `${format(start, "MMMM yyyy")} – ${format(end, "MMMM yyyy")}`;
    const titleLine = cover.content.showSubtitle
        ? `${dateRange}`
        : dateRange;

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
  transform: rotate(180deg);
  text-align: center;
  font-size: ${cover.typography.spineSizePt}pt;
  letter-spacing: ${cover.typography.letterSpacingEm}em;
}

/* Front cover */
.front {
  flex-direction: column;
  text-align: center;
}

.front h1 {
  font-size: ${cover.typography.titleSizePt}pt;
  font-weight: 600;
  margin: 0 0 0.4em 0;
}

.front h2 {
  font-size: ${cover.typography.authorSizePt}pt;
  font-weight: 400;
  margin: 0;
  letter-spacing: ${cover.typography.letterSpacingEm}em;
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
        ${author}<br />
        ${dateRange}
      </div>
    </section>

    <section class="front">
      <h1>${titleLine}</h1>
      <h2>${author}</h2>
      ${cover.content.showSubtitle ? `<div class="subtitle">${subtitle}</div>` : ""}
    </section>
  </div>
</body>
</html>`;
}
