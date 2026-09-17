// Slide 10: Seven feature pillars
// Type: Content - 2x4 grid of pillars
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("FEATURE PILLARS", {
    x: 0.5, y: 0.35, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  slide.addText("Seven pillars. One product.", {
    x: 0.5, y: 0.7, w: 9, h: 0.7,
    fontSize: 30, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  const pillars = [
    { n: "01", t: "The Notebook", d: "Sources, pages, threads, goals, check-ins. The durable object of the user's life." },
    { n: "02", t: "Three Inputs", d: "Voice, photo, chat. Multimodal capture that fits a phone." },
    { n: "03", t: "Three Outputs", d: "Chat with citations, check-in card, audio recap. Every claim cited." },
    { n: "04", t: "The Math Layer", d: "Deterministic engine next to the LLM. Numbers are reproducible, not sampled." },
    { n: "05", t: "Goals + Frameworks", d: "Curated library + free-form goal upload. The model reconciles goals against actuals." },
    { n: "06", t: "Privacy Architecture", d: "On-device by default. Cloud opt-in, E2E encrypted. We cannot read the data." },
    { n: "07", t: "Sharing + Social", d: "Watermarked cards for stories, couples mode, accountant export, public notebooks." }
  ];

  const cardW = 2.95;
  const cardH = 1.55;
  const gapX = 0.12;
  const gapY = 0.12;
  const startX = 0.5;
  const startY = 1.6;

  // First 6 pillars go in the 3x2 grid; 7th is a full-width callout below
  pillars.slice(0, 6).forEach((p, i) => {
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
    // Number
    slide.addText(p.n, {
      x: x + 0.2, y: y + 0.1, w: 0.6, h: 0.35,
      fontSize: 14, fontFace: "Calibri", bold: true,
      color: theme.accent, margin: 0
    });
    // Title
    slide.addText(p.t, {
      x: x + 0.2, y: y + 0.4, w: cardW - 0.4, h: 0.4,
      fontSize: 15, fontFace: "Calibri", bold: true,
      color: theme.primary, margin: 0
    });
    // Description
    slide.addText(p.d, {
      x: x + 0.2, y: y + 0.8, w: cardW - 0.4, h: 0.7,
      fontSize: 10, fontFace: "Calibri",
      color: theme.secondary, valign: "top", margin: 0
    });
  });

  // 7th pillar as a full-width callout below the grid
  const last = pillars[6];
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.85, w: 9, h: 0.55,
    fill: { color: theme.primary }, line: { type: "none" },
    rectRadius: 0.05
  });
  slide.addText(last.n + "  " + last.t + "  --  " + last.d, {
    x: 0.7, y: 4.85, w: 8.6, h: 0.55,
    fontSize: 11, fontFace: "Calibri",
    color: theme.bg, valign: "middle", margin: 0
  });

  slide.addText("10", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.bg, align: "right", margin: 0
  });
}

module.exports = { createSlide };
