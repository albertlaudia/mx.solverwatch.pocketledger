// Slide 1: Cover
// Type: Cover Page
// Layout: Asymmetric Left-Right

function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Left vertical accent bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.18, h: 5.625,
    fill: { color: theme.accent }, line: { type: "none" }
  });

  // Top brand tag
  slide.addText("POCKETLEDGER", {
    x: 0.6, y: 0.5, w: 6, h: 0.4,
    fontSize: 14, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 6, margin: 0
  });

  // Main title
  slide.addText("Your money, your model, your phone.", {
    x: 0.6, y: 1.2, w: 8.8, h: 1.8,
    fontSize: 48, fontFace: "Calibri", bold: true,
    color: theme.primary, valign: "top", margin: 0
  });

  // Subtitle
  slide.addText("The private, on-device AI finance notebook the post-Mint generation is asking for.", {
    x: 0.6, y: 3.2, w: 8.8, h: 1.0,
    fontSize: 20, fontFace: "Calibri Light",
    color: theme.secondary, valign: "top", margin: 0
  });

  // Divider line
  slide.addShape(pres.shapes.LINE, {
    x: 0.6, y: 4.35, w: 1.2, h: 0,
    line: { color: theme.accent, width: 2 }
  });

  // Meta info
  slide.addText("Platform strategy & technical architecture", {
    x: 0.6, y: 4.55, w: 8, h: 0.4,
    fontSize: 14, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  slide.addText("Built from the NotebookLM-for-finance signal | Q3 2026", {
    x: 0.6, y: 4.95, w: 8, h: 0.4,
    fontSize: 12, fontFace: "Calibri",
    color: theme.secondary, margin: 0
  });
}

module.exports = { createSlide };
