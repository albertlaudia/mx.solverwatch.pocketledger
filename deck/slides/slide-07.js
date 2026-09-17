// Slide 7: The Gap (the empty quadrant)
// Type: Content - Data Visualization (2x2 matrix)
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("THE GAP", {
    x: 0.5, y: 0.35, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  slide.addText("The empty quadrant. Nobody owns it.", {
    x: 0.5, y: 0.7, w: 9, h: 0.7,
    fontSize: 30, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  // Top column labels
  slide.addText("Privacy / No-bank-link", {
    x: 0.5, y: 1.45, w: 4.4, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.secondary, align: "center", margin: 0
  });
  slide.addText("Plaid-linked", {
    x: 5.1, y: 1.45, w: 4.4, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.secondary, align: "center", margin: 0
  });

  // Row labels positioned at the top of each row
  slide.addText("CONVERSATIONAL", {
    x: 0.5, y: 1.78, w: 4.4, h: 0.25,
    fontSize: 8, fontFace: "Calibri", bold: true,
    color: theme.secondary, charSpacing: 1, align: "center", margin: 0
  });
  slide.addText("DASHBOARD", {
    x: 0.5, y: 3.4, w: 4.4, h: 0.25,
    fontSize: 8, fontFace: "Calibri", bold: true,
    color: theme.secondary, charSpacing: 1, align: "center", margin: 0
  });

  // Quadrant dividers (subtle)
  slide.addShape(pres.shapes.LINE, {
    x: 4.95, y: 2.0, w: 0, h: 3.0,
    line: { color: theme.bg, width: 0.5 }
  });
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: 3.5, w: 9.0, h: 0,
    line: { color: theme.bg, width: 0.5 }
  });

  // TL: Empty quadrant (the gap) - PocketLedger lives here
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 2.1, w: 4.4, h: 1.3,
    fill: { color: theme.accent }, line: { type: "none" },
    rectRadius: 0.08
  });
  slide.addText("POCKETLEDGER LIVES HERE", {
    x: 0.5, y: 2.2, w: 4.4, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.bg, align: "center", charSpacing: 3, margin: 0
  });
  slide.addText("Conversational + private + grounded in your own papers", {
    x: 0.7, y: 2.55, w: 4.0, h: 0.45,
    fontSize: 13, fontFace: "Calibri", bold: true,
    color: theme.bg, align: "center", valign: "middle", margin: 0
  });
  slide.addText("NotebookLM has the chat. The finance apps have the math. Nobody ships both on a phone, with no bank link.", {
    x: 0.7, y: 3.0, w: 4.0, h: 0.4,
    fontSize: 9, fontFace: "Calibri", italic: true,
    color: theme.bg, align: "center", valign: "top", margin: 0
  });

  // TR: NotebookLM
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 2.1, w: 4.4, h: 1.3,
    fill: { color: theme.light }, line: { type: "none" },
    rectRadius: 0.08
  });
  slide.addText("NotebookLM", {
    x: 5.1, y: 2.25, w: 4.4, h: 0.4,
    fontSize: 16, fontFace: "Calibri", bold: true,
    color: theme.primary, align: "center", margin: 0
  });
  slide.addText("Chat OK  No-bank OK\nMath X  Mobile X  Privacy X", {
    x: 5.1, y: 2.7, w: 4.4, h: 0.65,
    fontSize: 11, fontFace: "Calibri",
    color: theme.secondary, align: "center", valign: "top", margin: 0
  });

  // BL: Finny / Vera
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 3.7, w: 4.4, h: 1.3,
    fill: { color: theme.light }, line: { type: "none" },
    rectRadius: 0.08
  });
  slide.addText("Finny / Vera", {
    x: 0.5, y: 3.85, w: 4.4, h: 0.4,
    fontSize: 16, fontFace: "Calibri", bold: true,
    color: theme.primary, align: "center", margin: 0
  });
  slide.addText("Mobile OK  No-bank OK\nChat X  Citations X  Ritual X", {
    x: 0.5, y: 4.3, w: 4.4, h: 0.65,
    fontSize: 11, fontFace: "Calibri",
    color: theme.secondary, align: "center", valign: "top", margin: 0
  });

  // BR: Monarch / Cleo / Rocket
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 3.7, w: 4.4, h: 1.3,
    fill: { color: theme.light }, line: { type: "none" },
    rectRadius: 0.08
  });
  slide.addText("Monarch / Cleo / Rocket", {
    x: 5.1, y: 3.85, w: 4.4, h: 0.4,
    fontSize: 16, fontFace: "Calibri", bold: true,
    color: theme.primary, align: "center", margin: 0
  });
  slide.addText("Mobile OK  Math OK  Plaid-linked\nNo-bank X  On-device privacy X", {
    x: 5.1, y: 4.3, w: 4.4, h: 0.65,
    fontSize: 11, fontFace: "Calibri",
    color: theme.secondary, align: "center", valign: "top", margin: 0
  });

  slide.addText("07", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.secondary, align: "right", margin: 0
  });
}

module.exports = { createSlide };
