// Slide 12: User journey - Maya's first 30 days
// Type: Content - Timeline
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("MAYA'S FIRST 30 DAYS", {
    x: 0.5, y: 0.35, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  slide.addText("From install to first real win.", {
    x: 0.5, y: 0.7, w: 9, h: 0.7,
    fontSize: 30, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  // Timeline: 5 milestones horizontally
  const steps = [
    { day: "Day 0", t: "Install", d: "28MB, no signup. \"No account needed. Your data lives on this phone.\" Pick a vibe." },
    { day: "Day 1", t: "First capture", d: "Snap a receipt. 3 seconds later: \"$4.75 at Blue Bottle, today 8:42am, Coffee. Looks right?\"" },
    { day: "Day 3", t: "First voice entry", d: "Walking home: \"Spent eighteen on Thai food.\" Swipe yes on the lock screen." },
    { day: "Day 7", t: "First check-in", d: "Sunday 7pm push. Top movers, anomalies, goal progress, aura. One tap to share." },
    { day: "Day 30", t: "First real win", d: "$140 less than last month. Three things drove it. Friend downloads PocketLedger." }
  ];

  const cardW = 1.75;
  const cardH = 2.6;
  const startX = 0.5;
  const gap = 0.12;
  const cardY = 1.65;

  steps.forEach((s, i) => {
    const x = startX + i * (cardW + gap);
    // Card
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x, y: cardY, w: cardW, h: cardH,
      fill: { color: theme.light }, line: { type: "none" },
      rectRadius: 0.08
    });
    // Day label
    slide.addText(s.day, {
      x: x, y: cardY + 0.1, w: cardW, h: 0.3,
      fontSize: 10, fontFace: "Calibri", bold: true,
      color: theme.accent, align: "center", charSpacing: 2, margin: 0
    });
    // Title
    slide.addText(s.t, {
      x: x + 0.1, y: cardY + 0.4, w: cardW - 0.2, h: 0.5,
      fontSize: 14, fontFace: "Calibri", bold: true,
      color: theme.primary, align: "center", margin: 0
    });
    // Divider
    slide.addShape(pres.shapes.LINE, {
      x: x + 0.5, y: cardY + 0.95, w: 0.75, h: 0,
      line: { color: theme.accent, width: 1 }
    });
    // Description
    slide.addText(s.d, {
      x: x + 0.15, y: cardY + 1.1, w: cardW - 0.3, h: 1.4,
      fontSize: 9, fontFace: "Calibri",
      color: theme.secondary, valign: "top", margin: 0
    });
  });

  // Connecting line under cards
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: 4.45, w: 9, h: 0,
    line: { color: theme.accent, width: 1, dashType: "dash" }
  });

  // Bottom callout
  slide.addText("The check-in ritual is the habit. Once a Sunday for 8 weeks, the switching cost is enormous.", {
    x: 0.5, y: 4.7, w: 9, h: 0.4,
    fontSize: 12, fontFace: "Calibri", italic: true,
    color: theme.primary, align: "center", margin: 0
  });

  slide.addText("12", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.secondary, align: "right", margin: 0
  });
}

module.exports = { createSlide };
