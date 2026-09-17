// Slide 17: Privacy architecture (the key hierarchy + E2E envelope)
// Type: Content - Data Visualization (key hierarchy diagram)
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("PRIVACY ARCHITECTURE", {
    x: 0.5, y: 0.35, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  slide.addText("The architecture enforces the privacy. Not the policy page.", {
    x: 0.5, y: 0.7, w: 9, h: 0.7,
    fontSize: 24, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  // Key hierarchy on the left
  slide.addText("KEY HIERARCHY", {
    x: 0.5, y: 1.55, w: 4.3, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 3, margin: 0
  });

  const keys = [
    { t: "Master key", d: "256-bit. Generated on install. Never leaves OS keystore (Secure Enclave / StrongBox / WebCrypto)." },
    { t: "Notebook key", d: "Derived via HKDF. Rotated on notebook delete." },
    { t: "Source key", d: "Derived from notebook. Allows per-source revocation." },
    { t: "Cloud envelope key", d: "One-time, wraps master for cross-device sync. We never see it unwrapped." }
  ];

  keys.forEach((k, i) => {
    const y = 1.95 + i * 0.65;
    // Indent indicator
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5 + i * 0.15, y: y, w: 0.1, h: 0.55,
      fill: { color: theme.accent }, line: { type: "none" }
    });
    slide.addText(k.t, {
      x: 0.75 + i * 0.15, y: y, w: 3.8, h: 0.25,
      fontSize: 12, fontFace: "Calibri", bold: true,
      color: theme.primary, margin: 0
    });
    slide.addText(k.d, {
      x: 0.75 + i * 0.15, y: y + 0.22, w: 3.8, h: 0.4,
      fontSize: 9, fontFace: "Calibri",
      color: theme.secondary, valign: "top", margin: 0
    });
  });

  // Right: E2E flow
  slide.addText("E2E SYNC FLOW (Pro tier, opt-in)", {
    x: 5.2, y: 1.55, w: 4.3, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 3, margin: 0
  });

  // Diagram: device A -> cloud (ciphertext) -> device B
  const flow = [
    { y: 1.95, l: "Device A", r: "generates cloudEnvelopeKey, encrypts master key locally, uploads ciphertext only" },
    { y: 2.6, l: "Apple / Google", r: "sees only ciphertext in their app-data scope. Cannot decrypt. Cannot read." },
    { y: 3.25, l: "Device B", r: "reads ciphertext, asks Device A for envelope key over local network or BLE" },
    { y: 3.9, l: "Both devices", r: "hold master key locally. Cloud stores only ciphertext. Forever." }
  ];

  flow.forEach((f, i) => {
    // Box
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.2, y: f.y, w: 4.3, h: 0.55,
      fill: { color: theme.light }, line: { type: "none" },
      rectRadius: 0.05
    });
    // Left tag
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.2, y: f.y, w: 1.3, h: 0.55,
      fill: { color: theme.primary }, line: { type: "none" },
      rectRadius: 0.05
    });
    slide.addText(f.l, {
      x: 5.2, y: f.y, w: 1.3, h: 0.55,
      fontSize: 10, fontFace: "Calibri", bold: true,
      color: theme.accent, align: "center", valign: "middle", margin: 0
    });
    slide.addText(f.r, {
      x: 6.6, y: f.y, w: 2.8, h: 0.55,
      fontSize: 9, fontFace: "Calibri",
      color: theme.primary, valign: "middle", margin: 0
    });
  });

  // Bottom callout
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.85, w: 9, h: 0.45,
    fill: { color: theme.accent }, line: { type: "none" },
    rectRadius: 0.05
  });
  slide.addText("We cannot read the notebook. Apple and Google cannot read the notebook. GDPR right-to-erasure is delete-the-app.", {
    x: 0.7, y: 4.85, w: 8.6, h: 0.45,
    fontSize: 12, fontFace: "Calibri", bold: true,
    color: theme.bg, valign: "middle", margin: 0
  });

  slide.addText("17", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.bg, align: "right", margin: 0
  });
}

module.exports = { createSlide };
