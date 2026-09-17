// Slide 11: Three inputs / three outputs (the symmetry)
// Type: Content - Comparison (inputs vs outputs)
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("THE SYMMETRY", {
    x: 0.5, y: 0.35, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  slide.addText("Three inputs. Three outputs. One model.", {
    x: 0.5, y: 0.7, w: 9, h: 0.7,
    fontSize: 30, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  // Left: Inputs column
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.7, w: 4.3, h: 3.1,
    fill: { color: theme.light }, line: { type: "none" },
    rectRadius: 0.1
  });
  slide.addText("INPUTS", {
    x: 0.7, y: 1.85, w: 3.9, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });
  slide.addText("How money gets in", {
    x: 0.7, y: 2.15, w: 3.9, h: 0.4,
    fontSize: 18, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });
  const inputs = [
    { i: "Voice", d: "\"Spent fourteen fifty on lunch.\" On-device STT + intent parser. <2s." },
    { i: "Photo", d: "Receipt, statement, contract. On-device OCR + LLM extraction. <3s for receipts." },
    { i: "Chat", d: "Long-form conversation. \"Where am I overspending?\" \"What changed in March?\"" }
  ];
  inputs.forEach((it, i) => {
    const y = 2.7 + i * 0.7;
    slide.addText(it.i, {
      x: 0.7, y: y, w: 1.2, h: 0.3,
      fontSize: 14, fontFace: "Calibri", bold: true,
      color: theme.accent, margin: 0
    });
    slide.addText(it.d, {
      x: 0.7, y: y + 0.28, w: 3.9, h: 0.4,
      fontSize: 10, fontFace: "Calibri",
      color: theme.secondary, valign: "top", margin: 0
    });
  });

  // Right: Outputs column
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.7, w: 4.3, h: 3.1,
    fill: { color: theme.primary }, line: { type: "none" },
    rectRadius: 0.1
  });
  slide.addText("OUTPUTS", {
    x: 5.4, y: 1.85, w: 3.9, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });
  slide.addText("How answers come back", {
    x: 5.4, y: 2.15, w: 3.9, h: 0.4,
    fontSize: 18, fontFace: "Calibri", bold: true,
    color: theme.bg, margin: 0
  });
  const outputs = [
    { i: "Chat + citations", d: "Every claim points to a source line. Tap to see the original. The trust wedge." },
    { i: "Check-in card", d: "1-page structured artifact. Top movers, anomalies, goal progress, aura." },
    { i: "Audio recap", d: "2-minute spoken summary. On-device TTS. Designed for the morning commute." }
  ];
  outputs.forEach((it, i) => {
    const y = 2.7 + i * 0.7;
    slide.addText(it.i, {
      x: 5.4, y: y, w: 3.9, h: 0.3,
      fontSize: 14, fontFace: "Calibri", bold: true,
      color: theme.accent, margin: 0
    });
    slide.addText(it.d, {
      x: 5.4, y: y + 0.28, w: 3.9, h: 0.4,
      fontSize: 10, fontFace: "Calibri",
      color: theme.bg, valign: "top", margin: 0
    });
  });

  // Bottom line
  slide.addText("\"Show me the math\" is one tap on every number. The math engine is a separate process, not a feature of the LLM.", {
    x: 0.5, y: 4.95, w: 9, h: 0.4,
    fontSize: 12, fontFace: "Calibri", italic: true,
    color: theme.secondary, align: "center", valign: "middle", margin: 0
  });

  slide.addText("11", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.secondary, align: "right", margin: 0
  });
}

module.exports = { createSlide };
