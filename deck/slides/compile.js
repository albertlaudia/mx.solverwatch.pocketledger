// Compile script - assembles all 18 slides into the final deck
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "PocketLedger Strategy Team";
pres.title = "PocketLedger - Platform Strategy & Architecture";
pres.company = "PocketLedger";

// Theme: Platinum White-Gold with deep navy
// bg: white | primary: deep navy | secondary: slate | accent: gold | light: warm card bg
const theme = {
  primary: "0A1F44",
  secondary: "5A6B85",
  accent: "B8972E",
  light: "F5F5F0",
  bg: "FFFFFF"
};

const slides = [
  "./slide-01.js",
  "./slide-02.js",
  "./slide-03.js",
  "./slide-04.js",
  "./slide-05.js",
  "./slide-06.js",
  "./slide-07.js",
  "./slide-08.js",
  "./slide-09.js",
  "./slide-10.js",
  "./slide-11.js",
  "./slide-12.js",
  "./slide-13.js",
  "./slide-14.js",
  "./slide-15.js",
  "./slide-16.js",
  "./slide-17.js",
  "./slide-18.js",
  "./slide-19.js",
  "./slide-20.js",
  "./slide-21.js",
  "./slide-22.js",
  "./slide-23.js",
  "./slide-24.js"
];

for (const s of slides) {
  require(s).createSlide(pres, theme);
}

pres.writeFile({ fileName: "./output/pocketledger-strategy-and-architecture.pptx" })
  .then(fn => console.log("Wrote: " + fn))
  .catch(err => { console.error(err); process.exit(1); });
