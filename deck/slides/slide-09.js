// Slide 9: Positioning and target user
// Type: Content - Mixed media (persona + positioning)
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("POSITIONING", {
    x: 0.5, y: 0.35, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  slide.addText("Built for Maya. Works for Daniel and Priya too.", {
    x: 0.5, y: 0.7, w: 9, h: 0.7,
    fontSize: 28, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  // Left: one-liner pitch
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.7, w: 4.3, h: 3.2,
    fill: { color: theme.primary }, line: { type: "none" },
    rectRadius: 0.1
  });
  slide.addText("ONE-LINE PITCH", {
    x: 0.7, y: 1.85, w: 4.0, h: 0.3,
    fontSize: 10, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });
  slide.addText("Your money, your model, your phone.", {
    x: 0.7, y: 2.25, w: 4.0, h: 1.4,
    fontSize: 28, fontFace: "Calibri", bold: true,
    color: theme.bg, valign: "top", margin: 0
  });
  slide.addShape(pres.shapes.LINE, {
    x: 0.7, y: 3.75, w: 0.8, h: 0,
    line: { color: theme.accent, width: 2 }
  });
  slide.addText("CATEGORY WE OWN", {
    x: 0.7, y: 3.95, w: 4.0, h: 0.3,
    fontSize: 10, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });
  slide.addText("Personal finance notebook. Not a budgeting app. Not an AI coach. A new thing.", {
    x: 0.7, y: 4.25, w: 4.0, h: 0.55,
    fontSize: 12, fontFace: "Calibri",
    color: theme.bg, valign: "top", margin: 0
  });

  // Right: three personas
  const personas = [
    { n: "Maya, 26", r: "Primary", d: "Designer, $42-68K, 1-2 cards, BNPL habit, privacy-conscious, AI-fluent." },
    { n: "Daniel, 41", r: "Pro arc", d: "Married, two kids, freelancer, mixes personal + business, needs audit-ready exports." },
    { n: "Priya, 19", r: "Gen-Z arc", d: "College, first card, parents send money, wants streaks without shame." }
  ];

  const px = 5.1;
  const pw = 4.4;
  const ph = 0.95;
  const py = 1.7;

  personas.forEach((p, i) => {
    const y = py + i * (ph + 0.12);
    slide.addShape(pres.shapes.RECTANGLE, {
      x: px, y: y, w: pw, h: ph,
      fill: { color: theme.light }, line: { type: "none" },
      rectRadius: 0.08
    });
    // Left accent
    slide.addShape(pres.shapes.RECTANGLE, {
      x: px, y: y, w: 0.08, h: ph,
      fill: { color: theme.accent }, line: { type: "none" }
    });
    slide.addText(p.n, {
      x: px + 0.25, y: y + 0.1, w: 2.5, h: 0.35,
      fontSize: 14, fontFace: "Calibri", bold: true,
      color: theme.primary, margin: 0
    });
    slide.addText(p.r, {
      x: px + 2.7, y: y + 0.1, w: 1.5, h: 0.35,
      fontSize: 10, fontFace: "Calibri", italic: true,
      color: theme.accent, align: "right", margin: 0
    });
    slide.addText(p.d, {
      x: px + 0.25, y: y + 0.45, w: 4.0, h: 0.5,
      fontSize: 10, fontFace: "Calibri",
      color: theme.secondary, valign: "top", margin: 0
    });
  });

  slide.addText("09", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.secondary, align: "right", margin: 0
  });
}

module.exports = { createSlide };
