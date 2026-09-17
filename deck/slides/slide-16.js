// Slide 16: The hybrid orchestration contract (what stays on-device, what goes to cloud)
// Type: Content - Comparison
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("THE HYBRID CONTRACT", {
    x: 0.5, y: 0.35, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  slide.addText("On-device by default. Cloud for what the local model cannot do.", {
    x: 0.5, y: 0.7, w: 9, h: 0.7,
    fontSize: 24, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  // Two columns
  // Left: on-device
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.6, w: 4.3, h: 3.3,
    fill: { color: theme.light }, line: { type: "none" },
    rectRadius: 0.08
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.6, w: 4.3, h: 0.4,
    fill: { color: theme.primary }, line: { type: "none" },
    rectRadius: 0.08
  });
  slide.addText("ON-DEVICE (default, forever)", {
    x: 0.7, y: 1.6, w: 4.1, h: 0.4,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 3, valign: "middle", margin: 0
  });
  const onDevice = [
    "Voice-to-text",
    "Photo OCR (receipts, statements)",
    "Transaction categorization",
    "Sum / group / delta / trend / projection",
    "Subscription detection",
    "Goal reconciliation",
    "Check-in composition",
    "Chat with citations, short context"
  ];
  onDevice.forEach((it, i) => {
    const y = 2.15 + i * 0.32;
    slide.addText("✓", {
      x: 0.75, y: y, w: 0.3, h: 0.3,
      fontSize: 12, fontFace: "Calibri", bold: true,
      color: theme.accent, margin: 0
    });
    slide.addText(it, {
      x: 1.05, y: y, w: 3.6, h: 0.3,
      fontSize: 11, fontFace: "Calibri",
      color: theme.primary, valign: "top", margin: 0
    });
  });

  // Right: cloud
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 1.6, w: 4.4, h: 3.3,
    fill: { color: theme.light }, line: { type: "none" },
    rectRadius: 0.08
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 1.6, w: 4.4, h: 0.4,
    fill: { color: theme.accent }, line: { type: "none" },
    rectRadius: 0.08
  });
  slide.addText("CLOUD (Pro tier, opt-in, E2E)", {
    x: 5.3, y: 1.6, w: 4.2, h: 0.4,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.bg, charSpacing: 3, valign: "middle", margin: 0
  });
  const cloud = [
    "Long-context chat (multi-year)",
    "\"What if\" scenario modeling",
    "Complex contract Q&A (v1.5)",
    "Tax-prep handoff (v2.0)",
    "Crypto onramp summaries (v2.0)",
    "",
    "Zero retention contract with provider",
    "No training, audit log on device"
  ];
  cloud.forEach((it, i) => {
    const y = 2.15 + i * 0.32;
    if (it.startsWith("Zero") || it.startsWith("No ")) {
      slide.addText("•", {
        x: 5.35, y: y, w: 0.3, h: 0.3,
        fontSize: 12, fontFace: "Calibri", bold: true,
        color: theme.primary, margin: 0
      });
      slide.addText(it, {
        x: 5.65, y: y, w: 3.7, h: 0.3,
        fontSize: 11, fontFace: "Calibri", italic: true,
        color: theme.primary, valign: "top", margin: 0
      });
    } else if (it) {
      slide.addText("→", {
        x: 5.35, y: y, w: 0.3, h: 0.3,
        fontSize: 12, fontFace: "Calibri", bold: true,
        color: theme.accent, margin: 0
      });
      slide.addText(it, {
        x: 5.65, y: y, w: 3.7, h: 0.3,
        fontSize: 11, fontFace: "Calibri",
        color: theme.primary, valign: "top", margin: 0
      });
    }
  });

  // Bottom rule
  slide.addText("Rule: if the task can be done by reading the user's own notebook deterministically, it stays on-device. Always.", {
    x: 0.5, y: 5.0, w: 9, h: 0.4,
    fontSize: 11, fontFace: "Calibri", italic: true,
    color: theme.secondary, align: "center", margin: 0
  });

  slide.addText("16", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.secondary, align: "right", margin: 0
  });
}

module.exports = { createSlide };
