// Slide 14: Section Divider 02 - The Architecture
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.primary };

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 3.2, h: 5.625,
    fill: { color: theme.accent }, line: { type: "none" }
  });

  slide.addText("02", {
    x: 0.5, y: 1.3, w: 2.4, h: 2.0,
    fontSize: 120, fontFace: "Calibri", bold: true,
    color: theme.bg, margin: 0
  });

  slide.addText("THE ARCHITECTURE", {
    x: 3.7, y: 1.8, w: 6, h: 0.5,
    fontSize: 14, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 6, margin: 0
  });

  slide.addText("Five layers.", {
    x: 3.7, y: 2.35, w: 6, h: 1.0,
    fontSize: 52, fontFace: "Calibri", bold: true,
    color: theme.bg, margin: 0
  });

  slide.addShape(pres.shapes.LINE, {
    x: 3.7, y: 3.4, w: 1.0, h: 0,
    line: { color: theme.accent, width: 2 }
  });

  slide.addText("Local-first, online-second, model-hot-swappable, structurally private. Designed so the company cannot read user data even if it wanted to.", {
    x: 3.7, y: 3.55, w: 5.8, h: 1.2,
    fontSize: 14, fontFace: "Calibri",
    color: theme.bg, valign: "top", margin: 0
  });

  slide.addText("14", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.bg, align: "right", margin: 0
  });
}

module.exports = { createSlide };
