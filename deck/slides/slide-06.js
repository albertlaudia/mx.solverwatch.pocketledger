// Slide 6: What users hate
// Type: Content - Text
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("WHAT USERS HATE", {
    x: 0.5, y: 0.35, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: "B91C1C", charSpacing: 4, margin: 0
  });

  slide.addText("Seven reasons the workflow does not survive contact with money.", {
    x: 0.5, y: 0.7, w: 9, h: 0.7,
    fontSize: 28, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  // Two-column grid of pain points
  const items = [
    { t: "The math is wrong", d: "No Python environment. RAG-on-chunks hallucinates averages and sums." },
    { t: "It pretends to be mobile", d: "Audio capped at 20 minutes, three per day. Two voices. No quick-log." },
    { t: "Wrong data substrate", d: "No live feed, no OCR, no voice. 50 sources / 500K words per source." },
    { t: "Privacy is performative", d: "Consumer tier trains on prompts. Workspace tier has telemetry. No on-device path." },
    { t: "No recurring ritual", d: "No monthly check-in template. No subscription detector. No goal progress view." },
    { t: "Dense, non-shareable output", d: "Text-heavy. No shareable report. Audio is chatty, not precise." },
    { t: "Black-box audit trail", d: "You see the cited passage. You do not see chunk boundaries, retrieval scores, or rejection criteria." }
  ];

  const colW = 4.4;
  const itemH = 0.85;

  items.forEach((it, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i < 4 ? i : i - 4;
    const x = 0.5 + col * (colW + 0.2);
    const y = 1.6 + row * itemH;
    // Number
    slide.addText(String(i + 1).padStart(2, "0"), {
      x: x, y: y, w: 0.5, h: 0.4,
      fontSize: 18, fontFace: "Calibri", bold: true,
      color: theme.accent, margin: 0
    });
    // Title
    slide.addText(it.t, {
      x: x + 0.5, y: y, w: colW - 0.5, h: 0.4,
      fontSize: 13, fontFace: "Calibri", bold: true,
      color: theme.primary, margin: 0
    });
    // Description
    slide.addText(it.d, {
      x: x + 0.5, y: y + 0.38, w: colW - 0.5, h: 0.45,
      fontSize: 10, fontFace: "Calibri",
      color: theme.secondary, valign: "top", margin: 0
    });
  });

  // Bottom callout
  slide.addText("Sources: Hudson Labs 2026, Yahoo Finance / Android Police 2025, Remio 2026, r/notebooklm 2026, XDA follow-up 2026.", {
    x: 0.5, y: 5.2, w: 8.5, h: 0.3,
    fontSize: 9, fontFace: "Calibri", italic: true,
    color: theme.secondary, margin: 0
  });

  slide.addText("06", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.secondary, align: "right", margin: 0
  });
}

module.exports = { createSlide };
