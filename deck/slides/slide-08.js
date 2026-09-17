// Slide 8: Section Divider 01 - The Product
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.primary };

  // Side accent block
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 3.2, h: 5.625,
    fill: { color: theme.accent }, line: { type: "none" }
  });

  // Number
  slide.addText("01", {
    x: 0.5, y: 1.3, w: 2.4, h: 2.0,
    fontSize: 120, fontFace: "Calibri", bold: true,
    color: theme.bg, margin: 0
  });

  // Section title
  slide.addText("THE PRODUCT", {
    x: 3.7, y: 1.8, w: 6, h: 0.5,
    fontSize: 14, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 6, margin: 0
  });

  slide.addText("PocketLedger", {
    x: 3.7, y: 2.35, w: 6, h: 1.0,
    fontSize: 52, fontFace: "Calibri", bold: true,
    color: theme.bg, margin: 0
  });

  // Intro
  slide.addText("A private, on-device AI finance notebook for your phone. The answer to the question the XDA article was trying to ask.", {
    x: 3.7, y: 3.55, w: 5.8, h: 1.2,
    fontSize: 14, fontFace: "Calibri",
    color: theme.bg, valign: "top", margin: 0
  });

  // Divider line
  slide.addShape(pres.shapes.LINE, {
    x: 3.7, y: 3.4, w: 1.0, h: 0,
    line: { color: theme.accent, width: 2 }
  });

  slide.addText("08", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.bg, align: "right", margin: 0
  });
}

module.exports = { createSlide };
