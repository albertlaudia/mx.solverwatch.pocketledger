// Slide 15: Five-layer architecture overview
// Type: Content - Mixed media (layered diagram)
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("FIVE LAYERS, TOP-DOWN", {
    x: 0.5, y: 0.35, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  slide.addText("Stacked by dependency, not by importance.", {
    x: 0.5, y: 0.7, w: 9, h: 0.7,
    fontSize: 26, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  // 5 layers as horizontal stacked bars
  const layers = [
    { n: "L5", t: "EXPERIENCE LAYER", d: "iOS / Android / Web / Watch", c: theme.primary, textColor: theme.bg },
    { n: "L4", t: "AGENT ORCHESTRATION", d: "Planner, tool router, citation engine, persona engine", c: theme.accent, textColor: theme.bg },
    { n: "L3", t: "INTELLIGENCE LAYER", d: "On-device LLM + deterministic math + OCR + optional cloud LLM", c: theme.primary, textColor: theme.bg },
    { n: "L2", t: "DATA LAYER", d: "Encrypted notebook store + source graph + E2E sync", c: theme.accent, textColor: theme.bg },
    { n: "L1", t: "PLATFORM LAYER", d: "Apple FM / Android AICore / WebGPU / Whisper / Keystore", c: theme.primary, textColor: theme.bg }
  ];

  const startY = 1.6;
  const layerH = 0.6;
  const gap = 0.08;

  layers.forEach((l, i) => {
    const y = startY + i * (layerH + gap);
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: y, w: 1.0, h: layerH,
      fill: { color: l.c }, line: { type: "none" },
      rectRadius: 0.05
    });
    slide.addText(l.n, {
      x: 0.5, y: y, w: 1.0, h: layerH,
      fontSize: 22, fontFace: "Calibri", bold: true,
      color: l.textColor, align: "center", valign: "middle", margin: 0
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 1.6, y: y, w: 7.9, h: layerH,
      fill: { color: theme.light }, line: { type: "none" },
      rectRadius: 0.05
    });
    slide.addText(l.t, {
      x: 1.8, y: y + 0.08, w: 7.5, h: 0.25,
      fontSize: 11, fontFace: "Calibri", bold: true,
      color: theme.primary, charSpacing: 3, margin: 0
    });
    slide.addText(l.d, {
      x: 1.8, y: y + 0.32, w: 7.5, h: 0.25,
      fontSize: 10, fontFace: "Calibri",
      color: theme.secondary, margin: 0
    });
  });

  // Bottom annotation
  slide.addText("The orchestrator never knows which model is on the other side. The platform never knows what the user asked. The company never sees the data.", {
    x: 0.5, y: 5.0, w: 9, h: 0.4,
    fontSize: 11, fontFace: "Calibri", italic: true,
    color: theme.secondary, align: "center", valign: "middle", margin: 0
  });

  slide.addText("15", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.secondary, align: "right", margin: 0
  });
}

module.exports = { createSlide };
