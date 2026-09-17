// Slide 22: Unit economics
// Type: Content - Data Visualization (metrics grid)
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("UNIT ECONOMICS", {
    x: 0.5, y: 0.35, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  slide.addText("We beat the category on every metric except ARPU.", {
    x: 0.5, y: 0.7, w: 9, h: 0.7,
    fontSize: 26, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  // Metric grid - 6 big numbers
  const metrics = [
    { v: "5.5x", l: "LTV / CAC (Y3)", s: "Industry healthy: 3-5x. We hit 5.5x." },
    { v: "7.3mo", l: "CAC payback (Y3)", s: "Industry healthy: <12mo. We hit 7.3." },
    { v: "94%", l: "Gross margin (Y3)", s: "On-device inference = near-zero variable cost." },
    { v: "8%", l: "Free -> Pro conversion (Y3)", s: "Monarch 5-7%, Rocket 11% (we win mid-funnel)." },
    { v: "$4.50", l: "Blended CPI (US)", s: "iOS Finance $11.62 global, $4.10 US Apple Search Ads." },
    { v: "0", l: "Free-tier variable cost", s: "Every chat on the free tier is free to us." }
  ];

  const cardW = 2.95;
  const cardH = 1.55;
  const startX = 0.5;
  const startY = 1.6;
  const gapX = 0.12;
  const gapY = 0.12;

  metrics.forEach((m, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);
    // Card
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x, y: y, w: cardW, h: cardH,
      fill: { color: theme.light }, line: { type: "none" },
      rectRadius: 0.08
    });
    // Top accent
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x, y: y, w: cardW, h: 0.06,
      fill: { color: theme.accent }, line: { type: "none" }
    });
    // Value
    slide.addText(m.v, {
      x: x + 0.2, y: y + 0.2, w: cardW - 0.4, h: 0.7,
      fontSize: 40, fontFace: "Calibri", bold: true,
      color: theme.primary, margin: 0
    });
    // Label
    slide.addText(m.l, {
      x: x + 0.2, y: y + 0.9, w: cardW - 0.4, h: 0.25,
      fontSize: 12, fontFace: "Calibri", bold: true,
      color: theme.accent, margin: 0
    });
    // Sub
    slide.addText(m.s, {
      x: x + 0.2, y: y + 1.15, w: cardW - 0.4, h: 0.4,
      fontSize: 9, fontFace: "Calibri",
      color: theme.secondary, valign: "top", margin: 0
    });
  });

  // Bottom comparison
  slide.addText("Comparison (Y3): Monarch $9.50 ARPU / 80% margin / 8-12mo payback. YNAB $9.08 / 85% / 6-9mo. PocketLedger $5.10 / 94% / 7.3mo. We win on margin + payback; they win on ARPU.", {
    x: 0.5, y: 4.95, w: 9, h: 0.4,
    fontSize: 9, fontFace: "Calibri", italic: true,
    color: theme.secondary, align: "center", margin: 0
  });

  slide.addText("22", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.secondary, align: "right", margin: 0
  });
}

module.exports = { createSlide };
