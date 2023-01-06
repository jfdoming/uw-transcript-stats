import fs from "fs";
import PDFParser from "pdf2json";

const STDIN = 0;

const pdfParser = new PDFParser();
pdfParser.on("pdfParser_dataReady", (pdfData) => {
  const { Pages } = pdfData;
  const allTexts = Pages.map(({ Texts }) => Texts).flat();
  const text = allTexts
    .map(({ R }) => R)
    .flat()
    .map(({ T }) => decodeURIComponent(T));
  console.log(text.join(" "));
});

fs.readFile(STDIN, (err, pdfBuffer) => {
  if (!err) {
    pdfParser.parseBuffer(pdfBuffer);
  }
});
