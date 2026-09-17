// Slide 5: What users love about the NotebookLM workflow
// Type: Content - Comparison
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("WHAT USERS LOVE", {
    x: 0.5, y: 0.35, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  slide.addText("Seven things the workflow does right.", {
    x: 0.5, y: 0.7, w: 9, h: 0.7,
    fontSize: 30, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  // Two-column list, 7 items
  const items = [
    "Upload-and-ask in eight minutes -- fast time-to-first-answer.",
    "Grounded answers with citations. No hallucination about the user's data.",
    "Plain English replaces dashboard navigation.",
    "Goals and frameworks uploaded as separate sources.",
    "Privacy is opt-in and explicit. No Plaid link by default.",
    "Recurring check-in cadence feels natural -- once a month, refresh, ask.",
    "Chat persists inside a bounded notebook. Bounded memory is the right memory."
  ];

  const colW = 4.4;
  const itemH = 0.95;

  items.forEach((it, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i < 4 ? i : i - 4;
    const x = 0.5 + col * (colW + 0.2);
    const y = 1.7 + row * itemH;
    // Check icon
    slide.addShape(pres.shapes.OVAL, {
      x: x, y: y + 0.05, w: 0.35, h: 0.35,
      fill: { color: theme.accent }, line: { type: "none" }
    });
    slide.addText("✓", {
      x: x, y: y + 0.05, w: 0.35, h: 0.35,
      fontSize: 14, fontFace: "Calibri", bold: true,
      color: theme.bg, align: "center", valign: "middle", margin: 0
    });
    // Text
    slide.addText(it, {
      x: x + 0.5, y: y, w: colW - 0.5, h: 0.8,
      fontSize: 12, fontFace: "Calibri",
      color: theme.primary, valign: "top", margin: 0
    });
  });

  // Bottom line
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 5.0, w: 9, h: 0.4,
    fill: { color: theme.light }, line: { type: "none" },
    rectRadius: 0.05
  });
  slide.addText("None of this is in the existing finance apps. All of it is in the demand.", {
    x: 0.7, y: 5.0, w: 8.6, h: 0.4,
    fontSize: 12, fontFace: "Calibri", italic: true,
    color: theme.primary, valign: "middle", margin: 0
  });

  slide.addText("05", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.secondary, align: "right", margin: 0
  });
}

module.exports = { createSlide };
