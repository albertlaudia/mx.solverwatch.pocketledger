// Slide 2: The signal
// Type: Content - Text (with visual)
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Top eyebrow
  slide.addText("THE SIGNAL", {
    x: 0.5, y: 0.35, w: 4, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  // Title
  slide.addText("One XDA headline hid a market.", {
    x: 0.5, y: 0.7, w: 9, h: 0.7,
    fontSize: 36, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  // Sub
  slide.addText("August 2025: a tech writer dragged bank statements into a research chatbot, called it brilliant, and the article crossed the personal-finance community in a weekend.", {
    x: 0.5, y: 1.45, w: 9, h: 0.9,
    fontSize: 14, fontFace: "Calibri",
    color: theme.secondary, margin: 0
  });

  // Three stat cards
  const cards = [
    { num: "8 min", label: "From install to first grounded answer about the user's own money" },
    { num: "70%+", label: "Of Gen Z say they are more careful with money than they used to be (Deloitte 2025)" },
    { num: "84%", label: "Of Gen Z and 79% of Millennials are familiar with generative AI (MEXC 2026)" }
  ];
  const cardY = 2.6;
  const cardH = 2.2;
  const cardW = 2.95;
  const gap = 0.15;
  const startX = 0.5;

  cards.forEach((c, i) => {
    const x = startX + i * (cardW + gap);
    // Card background
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x, y: cardY, w: cardW, h: cardH,
      fill: { color: theme.light }, line: { type: "none" },
      rectRadius: 0.1
    });
    // Top accent bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x, y: cardY, w: cardW, h: 0.08,
      fill: { color: theme.accent }, line: { type: "none" }
    });
    // Number
    slide.addText(c.num, {
      x: x + 0.25, y: cardY + 0.3, w: cardW - 0.5, h: 0.9,
      fontSize: 44, fontFace: "Calibri", bold: true,
      color: theme.primary, margin: 0
    });
    // Label
    slide.addText(c.label, {
      x: x + 0.25, y: cardY + 1.25, w: cardW - 0.5, h: 0.85,
      fontSize: 12, fontFace: "Calibri",
      color: theme.secondary, valign: "top", margin: 0
    });
  });

  // Source
  slide.addText("Source: XDA Developers 2025, Deloitte 2025/2026, MEXC 2026", {
    x: 0.5, y: 5.15, w: 7, h: 0.3,
    fontSize: 9, fontFace: "Calibri", italic: true,
    color: theme.secondary, margin: 0
  });

  // Page number
  slide.addText("02", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.secondary, align: "right", margin: 0
  });
}

module.exports = { createSlide };
