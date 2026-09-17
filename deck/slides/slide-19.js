// Slide 19: The LLM stack - five tiers
// Type: Content - Comparison/Stack diagram
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("THE LLM STACK", {
    x: 0.5, y: 0.35, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  slide.addText("Five tiers. Four run on the user's phone. One is opt-in cloud.", {
    x: 0.5, y: 0.7, w: 9, h: 0.7,
    fontSize: 24, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  // Five tiers stacked vertically
  const tiers = [
    { n: "T5", t: "Embedding (bge-small / Gemma embed)", d: "Vector search over the source graph. 33M params, 130MB. Runs on NPU.", c: theme.primary, textColor: theme.bg, cost: "$0" },
    { n: "T4", t: "Cloud LLM (Claude Haiku 4.5 + Sonnet 4.6)", d: "Pro opt-in. E2E encrypted. Zero retention. BAA. Deep analysis only.", c: theme.accent, textColor: theme.bg, cost: "$0.07/user/mo" },
    { n: "T3", t: "Bundled fallback: Phi-3 Mini 3.8B / Gemma 3 4B", d: "For older iPhones / Android without AICore. 4-bit quantized, 2.3-2.5GB.", c: theme.primary, textColor: theme.bg, cost: "$0" },
    { n: "T2", t: "OS-provided: Apple Foundation Models 3B / Gemini Nano 3.25B", d: "Free from Apple / Google. Ships in the OS. Zero bundle cost.", c: theme.accent, textColor: theme.bg, cost: "$0" },
    { n: "T1", t: "FunctionGemma 270M (the traffic controller)", d: "Routes queries to tools. 50 tok/s on phone. 0.3s TTFT. Fine-tuned on our 50-tool API.", c: theme.primary, textColor: theme.bg, cost: "$0" }
  ];

  const startY = 1.6;
  const tierH = 0.62;
  const gap = 0.08;

  tiers.forEach((t, i) => {
    const y = startY + i * (tierH + gap);
    // Tier number block
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: y, w: 0.9, h: tierH,
      fill: { color: t.c }, line: { type: "none" },
      rectRadius: 0.05
    });
    slide.addText(t.n, {
      x: 0.5, y: y, w: 0.9, h: tierH,
      fontSize: 18, fontFace: "Calibri", bold: true,
      color: t.textColor, align: "center", valign: "middle", margin: 0
    });
    // Description block
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 1.5, y: y, w: 6.8, h: tierH,
      fill: { color: theme.light }, line: { type: "none" },
      rectRadius: 0.05
    });
    slide.addText(t.t, {
      x: 1.65, y: y + 0.05, w: 6.5, h: 0.25,
      fontSize: 11, fontFace: "Calibri", bold: true,
      color: theme.primary, margin: 0
    });
    slide.addText(t.d, {
      x: 1.65, y: y + 0.3, w: 6.5, h: 0.3,
      fontSize: 9, fontFace: "Calibri",
      color: theme.secondary, valign: "top", margin: 0
    });
    // Cost block
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 8.4, y: y, w: 1.1, h: tierH,
      fill: { color: theme.accent }, line: { type: "none" },
      rectRadius: 0.05
    });
    slide.addText(t.cost, {
      x: 8.4, y: y, w: 1.1, h: tierH,
      fontSize: 11, fontFace: "Calibri", bold: true,
      color: theme.bg, align: "center", valign: "middle", margin: 0
    });
  });

  slide.addText("19", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.secondary, align: "right", margin: 0
  });
}

module.exports = { createSlide };
