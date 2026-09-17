// Slide 23: 3-year P&L
// Type: Content - Data Visualization (chart + table)
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  slide.addText("THREE-YEAR P&L", {
    x: 0.5, y: 0.35, w: 6, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 4, margin: 0
  });

  slide.addText("Break-even in Year 4 at ~$25M ARR. $58.5M total capital required.", {
    x: 0.5, y: 0.7, w: 9, h: 0.7,
    fontSize: 22, fontFace: "Calibri", bold: true,
    color: theme.primary, margin: 0
  });

  // Bar chart on the left
  const chartData = [
    { name: "Net revenue", labels: ["Y1", "Y2", "Y3", "Y4"], values: [0.14, 1.52, 5.51, 25.0] },
    { name: "Gross profit", labels: ["Y1", "Y2", "Y3", "Y4"], values: [0.09, 0.76, 5.20, 24.1] }
  ];

  slide.addChart(pres.charts.BAR, chartData, {
    x: 0.5, y: 1.6, w: 5.2, h: 3.2, barDir: "col",
    chartColors: [theme.accent, theme.primary],
    chartArea: { fill: { color: theme.bg } },
    catAxisLabelColor: theme.secondary, valAxisLabelColor: theme.secondary,
    valGridLine: { color: theme.light, size: 0.5 },
    catGridLine: { style: "none" },
    showValue: true, dataLabelPosition: "outEnd", dataLabelColor: theme.primary,
    dataLabelFontSize: 9,
    showLegend: true, legendPos: "b", legendColor: theme.secondary, legendFontSize: 9,
    showTitle: true, title: "Net revenue vs gross profit ($M)", titleColor: theme.primary, titleFontSize: 11,
    valAxisHidden: false
  });

  // Right: table
  slide.addText("THE NUMBERS", {
    x: 6.0, y: 1.55, w: 3.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri", bold: true,
    color: theme.accent, charSpacing: 3, margin: 0
  });

  const rows = [
    ["MAU (avg)", "125K", "600K", "1.75M", "3.5M"],
    ["Pro subs", "5K", "36K", "140K", "420K"],
    ["Net revenue", "$144K", "$1.5M", "$5.5M", "$25M"],
    ["Gross margin", "65%", "50%", "89%", "96%"],
    ["Net income", "($1.5M)", "($3.6M)", "($3.6M)", "+$10M"],
    ["LTV/CAC (Pro)", "0.6x", "2.4x", "5.5x", "10x"],
    ["Payback (mo)", "42", "17", "7.3", "4.7"]
  ];

  // Header row
  const headers = ["", "Y1", "Y2", "Y3", "Y4"];
  const colX = [6.0, 6.9, 7.7, 8.5, 9.3];
  const colW = [0.9, 0.8, 0.8, 0.8, 0.7];

  headers.forEach((h, i) => {
    slide.addText(h, {
      x: colX[i], y: 1.85, w: colW[i], h: 0.3,
      fontSize: 9, fontFace: "Calibri", bold: true,
      color: theme.secondary, align: i === 0 ? "left" : "right", margin: 0
    });
  });
  // Divider
  slide.addShape(pres.shapes.LINE, {
    x: 6.0, y: 2.15, w: 3.5, h: 0,
    line: { color: theme.accent, width: 1 }
  });

  rows.forEach((r, ri) => {
    const y = 2.2 + ri * 0.32;
    r.forEach((cell, ci) => {
      slide.addText(cell, {
        x: colX[ci], y: y, w: colW[ci], h: 0.3,
        fontSize: 9, fontFace: "Calibri", bold: ci === 0,
        color: ci === 0 ? theme.primary : theme.secondary,
        align: ci === 0 ? "left" : "right", valign: "middle", margin: 0
      });
    });
  });

  // Bottom callout
  slide.addText("Path: Pre-seed $500K -> Seed $3M -> Series A $15M -> Series B $40M -> profitable at $25M ARR. ~$58.5M total raised.", {
    x: 0.5, y: 4.95, w: 9, h: 0.4,
    fontSize: 10, fontFace: "Calibri", italic: true,
    color: theme.secondary, align: "center", margin: 0
  });

  slide.addText("23", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri",
    color: theme.secondary, align: "right", margin: 0
  });
}

module.exports = { createSlide };
