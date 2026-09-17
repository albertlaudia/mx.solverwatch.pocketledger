// Slide 21: Cost model - CapEx + OpEx
// Type: Content - Data Visualization (table)
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("THE COST MODEL", {
    x: 0.5, y: 0.35, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  slide.addText("$1.2M to ship. $141K/mo at 100K MAU.", {
    x: 0.5, y: 0.7, w: 9, h: 0.7,
    fontSize: 26, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  // Left: CapEx table
  slide.addText("CAPEX (one-time, v1.0 ship)", {
    x: 0.5, y: 1.55, w: 4.3, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 3, margin: 0
  });

  const capex = [
    ["Product design (2 designers x 6mo)", "$180K"],
    ["iOS engineering (2 x 6mo)", "$300K"],
    ["Android engineering (2 x 6mo)", "$300K"],
    ["Backend (1 x 4mo)", "$100K"],
    ["ML / on-device (1 x 6mo)", "$150K"],
    ["QA (1 x 6mo)", "$90K"],
    ["Design system + assets", "$40K"],
    ["Legal (BAA, privacy, ToS)", "$25K"],
    ["Total CapEx", "$1.2M"]
  ];

  capex.forEach((row, i) => {
    const y = 1.9 + i * 0.28;
    const isTotal = i === capex.length - 1;
    if (isTotal) {
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.5, y: y, w: 4.3, h: 0.3,
        fill: { color: theme.primary }, line: { type: "none" },
        rectRadius: 0.03
      });
    }
    slide.addText(row[0], {
      x: 0.55, y: y, w: 3.2, h: 0.3,
      fontSize: 10, fontFace: "Calibri",
      color: isTotal ? theme.bg : theme.primary,
      bold: isTotal, valign: "middle", margin: 0
    });
    slide.addText(row[1], {
      x: 3.7, y: y, w: 1.05, h: 0.3,
      fontSize: 10, fontFace: "Calibri", bold: isTotal,
      color: isTotal ? theme.accent : theme.primary,
      align: "right", valign: "middle", margin: 0
    });
  });

  // Right: OpEx table
  slide.addText("OPEX (monthly, at 100K MAU)", {
    x: 5.1, y: 1.55, w: 4.4, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 3, margin: 0
  });

  const opex = [
    ["Salaries (8 people, loaded)", "$80K"],
    ["Marketing (UA + content)", "$50K"],
    ["Cloud LLM (Pro opt-in)", "$7K"],
    ["Plaid (Pro opt-in)", "$1K"],
    ["Cloud infra (Dokploy)", "$0.3K"],
    ["Tools (Sentry, ASO, Notion)", "$2K"],
    ["Anthropic BAA (amortized)", "$1K"],
    ["Apple/Google dev fees", "$0.03K"],
    ["Total OpEx", "$141K"]
  ];

  opex.forEach((row, i) => {
    const y = 1.9 + i * 0.28;
    const isTotal = i === opex.length - 1;
    if (isTotal) {
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 5.1, y: y, w: 4.4, h: 0.3,
        fill: { color: theme.primary }, line: { type: "none" },
        rectRadius: 0.03
      });
    }
    slide.addText(row[0], {
      x: 5.15, y: y, w: 3.2, h: 0.3,
      fontSize: 10, fontFace: "Calibri",
      color: isTotal ? theme.bg : theme.primary,
      bold: isTotal, valign: "middle", margin: 0
    });
    slide.addText(row[1], {
      x: 8.3, y: y, w: 1.15, h: 0.3,
      fontSize: 10, fontFace: "Calibri", bold: isTotal,
      color: isTotal ? theme.accent : theme.primary,
      align: "right", valign: "middle", margin: 0
    });
  });

  // Bottom callout
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.85, w: 9, h: 0.45,
    fill: { color: theme.accent }, line: { type: "none" },
    rectRadius: 0.05
  });
  slide.addText("Variable cost on the free tier is $0. The on-device model runs on the user's phone. Cloud LLM is only for Pro deep analysis.", {
    x: 0.7, y: 4.85, w: 8.6, h: 0.45,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.bg, valign: "middle", margin: 0
  });

  slide.addText("21", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.bg, align: "right", margin: 0
  });
}

module.exports = { createSlide };
