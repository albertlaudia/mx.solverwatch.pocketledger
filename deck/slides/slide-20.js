// Slide 20: The user journey with timing
// Type: Content - Timeline with timings
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("HOW EASY IS IT TO USE?", {
    x: 0.5, y: 0.35, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  slide.addText("Four key moments. Measured in seconds.", {
    x: 0.5, y: 0.7, w: 9, h: 0.7,
    fontSize: 26, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  // Four moments
  const moments = [
    { day: "Day 0", action: "Install to first insight", time: "90s", detail: "5s of app time, 85s of human. All on-device, all private." },
    { day: "Day 7", action: "First weekly check-in", time: "12s", detail: "Top movers, anomalies, goal progress, aura, watermarked share." },
    { day: "Day 14", action: "First chat query", time: "<1s to first token", detail: "\"Where am I overspending?\" Cited answer, tappable sources." },
    { day: "Day 30", action: "Accountant export", time: "8s for 30 days", detail: "PDF + CSV with receipt thumbnails. Faster than opening Excel." }
  ];

  const startY = 1.7;
  const rowH = 0.78;
  const gap = 0.1;

  moments.forEach((m, i) => {
    const y = startY + i * (rowH + gap);
    // Row background
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: y, w: 9, h: rowH,
      fill: { color: theme.light }, line: { type: "none" },
      rectRadius: 0.05
    });
    // Day tag
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: y, w: 1.1, h: rowH,
      fill: { color: theme.primary }, line: { type: "none" },
      rectRadius: 0.05
    });
    slide.addText(m.day, {
      x: 0.5, y: y, w: 1.1, h: rowH,
      fontSize: 12, fontFace: "Calibri", bold: true,
      color: theme.accent, align: "center", valign: "middle", margin: 0
    });
    // Action
    slide.addText(m.action, {
      x: 1.8, y: y + 0.1, w: 4.0, h: 0.35,
      fontSize: 14, fontFace: "Calibri", bold: true,
      color: theme.primary, margin: 0
    });
    // Detail
    slide.addText(m.detail, {
      x: 1.8, y: y + 0.4, w: 4.0, h: 0.4,
      fontSize: 10, fontFace: "Calibri",
      color: theme.secondary, valign: "top", margin: 0
    });
    // Time
    slide.addText(m.time, {
      x: 6.0, y: y, w: 3.4, h: rowH,
      fontSize: 22, fontFace: "Calibri", bold: true,
      color: theme.accent, align: "right", valign: "middle", margin: 0
    });
  });

  // Bottom callout: 8 rules
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.95, w: 9, h: 0.45,
    fill: { color: theme.accent }, line: { type: "none" },
    rectRadius: 0.05
  });
  slide.addText("Eight rules: zero taps to value, no forms, no dashboard before data, every number ships with its calculation, every claim is cited.", {
    x: 0.7, y: 4.95, w: 8.6, h: 0.45,
    fontSize: 10, fontFace: "Calibri", bold: true,
    color: theme.bg, valign: "middle", margin: 0
  });

  slide.addText("20", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.bg, align: "right", margin: 0
  });
}

module.exports = { createSlide };
