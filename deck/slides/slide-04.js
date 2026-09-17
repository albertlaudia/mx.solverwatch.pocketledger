// Slide 4: Why this went viral - the demand signature
// Type: Content - Text with icons
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("THE DEMAND SIGNATURE", {
    x: 0.5, y: 0.35, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  slide.addText("Three vectors converge in the same place.", {
    x: 0.5, y: 0.7, w: 9, h: 0.7,
    fontSize: 30, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  // Three rows
  const rows = [
    {
      tag: "01",
      title: "The post-Mint vacuum",
      body: "Intuit killed Mint on March 23, 2024. 3.6M users scattered. Monarch grew 20x, but every successor inherited a dashboard, not a dialogue. The user still has to interpret the chart."
    },
    {
      tag: "02",
      title: "Gen Z: mobile-first + AI-fluent + financially anxious",
      body: "66% bank on mobile. 80%+ say money causes stress. 84% are familiar with gen AI. 70% are more careful than a year ago. They want a tool that explains, not one that displays."
    },
    {
      tag: "03",
      title: "The privacy + aggregation paradox",
      body: "1 in 2 US adults have linked via Plaid. The 2022 $58M class action is public. The same user who plugs Plaid into Monarch hand-redacts their bank statement before uploading it to NotebookLM."
    }
  ];

  const rowH = 1.15;
  const startY = 1.7;
  const gap = 0.1;

  rows.forEach((r, i) => {
    const y = startY + i * (rowH + gap);
    // Row background
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: y, w: 9, h: rowH,
      fill: { color: theme.light }, line: { type: "none" },
      rectRadius: 0.08
    });
    // Tag block
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: y, w: 0.9, h: rowH,
      fill: { color: theme.primary }, line: { type: "none" },
      rectRadius: 0.08
    });
    slide.addText(r.tag, {
      x: 0.5, y: y, w: 0.9, h: rowH,
      fontSize: 28, fontFace: "Calibri", bold: true,
      color: theme.accent, align: "center", valign: "middle", margin: 0
    });
    // Title
    slide.addText(r.title, {
      x: 1.6, y: y + 0.15, w: 7.7, h: 0.4,
      fontSize: 16, fontFace: "Calibri", bold: true,
      color: theme.primary, margin: 0
    });
    // Body
    slide.addText(r.body, {
      x: 1.6, y: y + 0.55, w: 7.7, h: 0.55,
      fontSize: 11, fontFace: "Calibri",
      color: theme.secondary, valign: "top", margin: 0
    });
  });

  slide.addText("Sources: Deloitte 2025/2026, MEXC 2026, Plaid 2026, Luminix industry report 2026", {
    x: 0.5, y: 5.2, w: 7, h: 0.3,
    fontSize: 9, fontFace: "Calibri", italic: true,
    color: theme.secondary, margin: 0
  });

  slide.addText("04", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.secondary, align: "right", margin: 0
  });
}

module.exports = { createSlide };
