// Slide 3: What the user actually did
// Type: Content - Timeline / Process
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("THE WORKFLOW THAT WENT VIRAL", {
    x: 0.5, y: 0.35, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  slide.addText("Eight minutes from panic to a model that knows your money.", {
    x: 0.5, y: 0.7, w: 9, h: 0.7,
    fontSize: 30, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  // Four steps in horizontal flow
  const steps = [
    { n: "1", t: "Upload sources", d: "Bank statements, credit-card PDFs, brokerage summaries -- all as documents." },
    { n: "2", t: "Add goals", d: "A second doc: \"reduce discretionary spend, build a buffer, invest more.\"" },
    { n: "3", t: "Add frameworks", d: "Articles on budgeting, investing, debt -- so the model knows your lens." },
    { n: "4", t: "Ask in plain English", d: "\"Where am I overspending?\" \"What changed this month?\"" }
  ];

  const startX = 0.5;
  const cardW = 2.18;
  const gap = 0.12;
  const cardY = 1.9;
  const cardH = 2.6;

  steps.forEach((s, i) => {
    const x = startX + i * (cardW + gap);
    // Card
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x, y: cardY, w: cardW, h: cardH,
      fill: { color: theme.light }, line: { type: "none" },
      rectRadius: 0.1
    });
    // Number circle
    slide.addShape(pres.shapes.OVAL, {
      x: x + 0.2, y: cardY + 0.2, w: 0.5, h: 0.5,
      fill: { color: theme.accent }, line: { type: "none" }
    });
    slide.addText(s.n, {
      x: x + 0.2, y: cardY + 0.2, w: 0.5, h: 0.5,
      fontSize: 18, fontFace: "Calibri", bold: true,
      color: theme.bg, align: "center", valign: "middle", margin: 0
    });
    // Title
    slide.addText(s.t, {
      x: x + 0.2, y: cardY + 0.85, w: cardW - 0.4, h: 0.5,
      fontSize: 16, fontFace: "Calibri", bold: true,
      color: theme.primary, margin: 0
    });
    // Description
    slide.addText(s.d, {
      x: x + 0.2, y: cardY + 1.35, w: cardW - 0.4, h: 1.15,
      fontSize: 11, fontFace: "Calibri",
      color: theme.secondary, valign: "top", margin: 0
    });
    // Arrow to next (except last)
    if (i < steps.length - 1) {
      slide.addShape(pres.shapes.RIGHT_TRIANGLE, {
        x: x + cardW + 0.005, y: cardY + 1.2, w: 0.11, h: 0.2,
        fill: { color: theme.accent }, line: { type: "none" },
        rotate: 90
      });
    }
  });

  // Bottom callout
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.75, w: 9, h: 0.6,
    fill: { color: theme.primary }, line: { type: "none" },
    rectRadius: 0.05
  });
  slide.addText("A consumer research tool, in eight minutes, replaced her budgeting app. That is not a productivity hack. That is a category signal.", {
    x: 0.7, y: 4.75, w: 8.6, h: 0.6,
    fontSize: 13, fontFace: "Calibri", italic: true,
    color: theme.bg, valign: "middle", margin: 0
  });

  slide.addText("03", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.bg, align: "right", margin: 0
  });
}

module.exports = { createSlide };
