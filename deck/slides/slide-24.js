// Slide 24: Closing - the one-page story
// Type: Summary / Closing - Key Takeaways + CTA
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.primary };

  // Eyebrow
  slide.addText("THE STORY", {
    x: 0.5, y: 0.5, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  // Title
  slide.addText("On-device AI. Zero variable cost. 18-month window.", {
    x: 0.5, y: 0.85, w: 9, h: 1.1,
    fontSize: 30, fontFace: "Calibri", bold: true,
    color: theme.bg, margin: 0
  });

  // Divider
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: 2.0, w: 1.0, h: 0,
    line: { color: theme.accent, width: 2 }
  });

  // The one-line pitch
  slide.addText("\"A private, on-device AI finance notebook for the post-Mint, AI-native generation. $58.5M to break-even at $25M ARR. 8.5x MOIC at the median exit.\"", {
    x: 0.5, y: 2.2, w: 9, h: 0.7,
    fontSize: 14, fontFace: "Calibri", italic: true,
    color: theme.bg, margin: 0
  });

  // Three numbers
  const numbers = [
    { v: "5.5x", l: "LTV / CAC by Y3", d: "Industry healthy 3-5x. We sit at the top." },
    { v: "94%", l: "Gross margin by Y3", d: "On-device inference = near-zero variable cost." },
    { v: "$58.5M", l: "Total capital to break-even", d: "Four rounds. Four years. Profitable at $25M ARR." }
  ];

  numbers.forEach((n, i) => {
    const y = 3.05 + i * 0.55;
    slide.addText(n.v, {
      x: 0.5, y: y, w: 1.8, h: 0.5,
      fontSize: 24, fontFace: "Calibri", bold: true,
      color: theme.accent, valign: "middle", margin: 0
    });
    slide.addText(n.l, {
      x: 2.4, y: y, w: 3.0, h: 0.25,
      fontSize: 12, fontFace: "Calibri", bold: true,
      color: theme.bg, margin: 0
    });
    slide.addText(n.d, {
      x: 2.4, y: y + 0.22, w: 7.0, h: 0.3,
      fontSize: 10, fontFace: "Calibri",
      color: theme.bg, margin: 0
    });
  });

  // Bottom CTA
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.7, w: 9, h: 0.5,
    fill: { color: theme.accent }, line: { type: "none" },
    rectRadius: 0.05
  });
  slide.addText("Next step: close the $500K pre-seed, ship the iOS prototype in 8 weeks, capture the XDA signal by Q1 2027.", {
    x: 0.7, y: 4.7, w: 8.6, h: 0.5,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.bg, valign: "middle", margin: 0
  });

  slide.addText("24", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.bg, align: "right", margin: 0
  });
}

module.exports = { createSlide };
