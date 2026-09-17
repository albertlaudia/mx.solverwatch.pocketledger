// Slide 18: Summary / Closing
// Type: Summary / Closing - Key Takeaways + CTA
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.primary };

  // Top eyebrow
  slide.addText("CLOSING", {
    x: 0.5, y: 0.5, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  // Main title
  slide.addText("A new category is hiding inside one headline.", {
    x: 0.5, y: 0.85, w: 9, h: 1.1,
    fontSize: 38, fontFace: "Calibri", bold: true,
    color: theme.bg, margin: 0
  });

  // Divider
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: 2.0, w: 1.0, h: 0,
    line: { color: theme.accent, width: 2 }
  });

  // Three takeaways
  const takeaways = [
    {
      t: "The demand is real",
      d: "Post-Mint, AI-fluent, financially anxious, mobile-first. NotebookLM surfaced the signal because it was the only tool that already existed."
    },
    {
      t: "The gap is empty",
      d: "Conversational + grounded + on-device + mobile + no-bank-link + the math. Nobody owns this quadrant."
    },
    {
      t: "The moat is structural",
      d: "On-device model hot-swap. Deterministic math engine. E2E envelope. Source graph + citations. Check-in ritual. None of this is easy to copy."
    }
  ];

  takeaways.forEach((tk, i) => {
    const y = 2.2 + i * 0.7;
    // Check mark
    slide.addShape(pres.shapes.OVAL, {
      x: 0.5, y: y + 0.05, w: 0.35, h: 0.35,
      fill: { color: theme.accent }, line: { type: "none" }
    });
    slide.addText(String(i + 1), {
      x: 0.5, y: y + 0.05, w: 0.35, h: 0.35,
      fontSize: 14, fontFace: "Calibri", bold: true,
      color: theme.bg, align: "center", valign: "middle", margin: 0
    });
    // Title
    slide.addText(tk.t, {
      x: 1.0, y: y, w: 8.5, h: 0.3,
      fontSize: 16, fontFace: "Calibri", bold: true,
      color: theme.bg, margin: 0
    });
    // Description
    slide.addText(tk.d, {
      x: 1.0, y: y + 0.3, w: 8.5, h: 0.4,
      fontSize: 11, fontFace: "Calibri",
      color: theme.bg, valign: "top", margin: 0
    });
  });

  // Bottom CTA
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.55, w: 9, h: 0.65,
    fill: { color: theme.accent }, line: { type: "none" },
    rectRadius: 0.05
  });
  slide.addText("Next step: ship the spine in Q1. iOS + Android v1.0. On-device chat + math + voice + photo. Free forever. The category will follow.", {
    x: 0.7, y: 4.55, w: 8.6, h: 0.65,
    fontSize: 12, fontFace: "Calibri", bold: true,
    color: theme.bg, valign: "middle", margin: 0
  });

  slide.addText("18", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.bg, align: "right", margin: 0
  });
}

module.exports = { createSlide };
