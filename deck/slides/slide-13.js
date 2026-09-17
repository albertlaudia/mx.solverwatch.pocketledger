// Slide 13: Monetization & success metrics
// Type: Content - Data Visualization (pricing tiers + north star)
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("MONETIZATION & METRICS", {
    x: 0.5, y: 0.35, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  slide.addText("Cheaper than the category. Funnel over ARPU in year one.", {
    x: 0.5, y: 0.7, w: 9, h: 0.7,
    fontSize: 26, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  // Three pricing columns
  const tiers = [
    {
      n: "FREE",
      p: "$0",
      sub: "forever, no ads",
      f: ["1 notebook, 5 pages", "30 days history", "30 logs / day", "On-device model", "1 curated framework", "Check-in card, no share"]
    },
    {
      n: "PRO",
      p: "$4.99",
      sub: "per month or $39.99/yr",
      f: ["Unlimited everything", "All 30 frameworks", "Plaid link (opt-in)", "Couples mode", "Accountant export (PDF + CSV)", "E2E cloud sync"]
    },
    {
      n: "FAMILY",
      p: "$7.99",
      sub: "per month, up to 5 devices",
      f: ["One shared notebook", "Personal notebooks", "Kids mode", "Allowance + visibility", "E2E cloud sync", "Priority on-device model"]
    }
  ];

  const cardW = 2.95;
  const cardH = 3.0;
  const startX = 0.5;
  const gap = 0.12;
  const startY = 1.55;

  tiers.forEach((t, i) => {
    const x = startX + i * (cardW + gap);
    const isPro = i === 1;
    // Card
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x, y: startY, w: cardW, h: cardH,
      fill: { color: isPro ? theme.primary : theme.light },
      line: { type: "none" },
      rectRadius: 0.08
    });
    // Top accent bar
    if (isPro) {
      slide.addShape(pres.shapes.RECTANGLE, {
        x: x, y: startY, w: cardW, h: 0.08,
        fill: { color: theme.accent }, line: { type: "none" }
      });
    }
    // Tier name
    slide.addText(t.n, {
      x: x + 0.25, y: startY + 0.2, w: cardW - 0.5, h: 0.35,
      fontSize: 14, fontFace: "Calibri", bold: true,
      color: isPro ? theme.accent : theme.primary, charSpacing: 4, margin: 0
    });
    // Price
    slide.addText(t.p, {
      x: x + 0.25, y: startY + 0.55, w: cardW - 0.5, h: 0.6,
      fontSize: 36, fontFace: "Calibri", bold: true,
      color: isPro ? theme.bg : theme.primary, margin: 0
    });
    // Sub
    slide.addText(t.sub, {
      x: x + 0.25, y: startY + 1.15, w: cardW - 0.5, h: 0.3,
      fontSize: 10, fontFace: "Calibri", italic: true,
      color: isPro ? theme.bg : theme.secondary, margin: 0
    });
    // Divider
    slide.addShape(pres.shapes.LINE, {
      x: x + 0.25, y: startY + 1.5, w: cardW - 0.5, h: 0,
      line: { color: isPro ? theme.accent : theme.accent, width: 1 }
    });
    // Features
    const featText = t.f.map((ft, idx) => ({
      text: ft, options: { bullet: { code: "25A0" }, breakLine: idx < t.f.length - 1 }
    }));
    slide.addText(featText, {
      x: x + 0.25, y: startY + 1.6, w: cardW - 0.5, h: 1.3,
      fontSize: 10, fontFace: "Calibri",
      color: isPro ? theme.bg : theme.primary, valign: "top", margin: 0
    });
  });

  // Bottom: North star
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.7, w: 9, h: 0.55,
    fill: { color: theme.accent }, line: { type: "none" },
    rectRadius: 0.05
  });
  slide.addText("NORTH STAR: Weekly Check-ins Completed (WCC). Anti-metric: bank accounts linked -- we want this low.", {
    x: 0.7, y: 4.7, w: 8.6, h: 0.55,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.bg, valign: "middle", margin: 0
  });

  slide.addText("13", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.secondary, align: "right", margin: 0
  });
}

module.exports = { createSlide };
