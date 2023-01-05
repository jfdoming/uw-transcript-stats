import fs from "fs";
import PDFParser from "pdf2json";

const pdfParser = new PDFParser();

fs.readFile(pdfFilePath, (err, pdfBuffer) => {
  if (!err) {
    pdfParser.parseBuffer(pdfBuffer);
  }
});
