import PDFDocument from "pdfkit";

function streamPdf(res, filename, draw) {
  const doc = new PDFDocument({ size: "A4", margin: 48 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);
  doc.fillColor("#0f172a").fontSize(18).text("Elara Medical Centre", { continued: false });
  doc.fontSize(10).fillColor("#64748b").text("Outpatient · Electronic Health Record");
  doc.moveDown();
  draw(doc);
  doc.end();
}

export function renderInvoicePdf(res, bill) {
  streamPdf(res, `${bill.invoiceNo}.pdf`, (doc) => {
    doc.fillColor("#0f172a").fontSize(14).text(`Invoice ${bill.invoiceNo}`);
    doc.fontSize(11).fillColor("#334155").text(`Patient: ${bill.patient?.name || ""}`);
    doc.text(`Status: ${bill.status}`);
    doc.moveDown();
    (bill.lines || []).forEach((line) => {
      doc.text(`${line.label}  —  ₹${line.amount}`);
    });
    doc.moveDown();
    doc.fontSize(12).text(`Total  ₹${bill.total}`);
  });
}

export function renderPrescriptionPdf(res, rx) {
  streamPdf(res, `rx-${rx._id}.pdf`, (doc) => {
    doc.fillColor("#0f172a").fontSize(14).text("Prescription");
    doc.fontSize(11).fillColor("#334155").text(`Patient: ${rx.patient?.name || ""}`);
    doc.text(`Doctor: ${rx.doctor?.name || ""}`);
    doc.moveDown();
    (rx.items || []).forEach((item, i) => {
      doc.text(`${i + 1}. ${item.medicine}  ${item.dosage}  × ${item.duration}`);
      if (item.instructions) doc.fontSize(10).fillColor("#64748b").text(`   ${item.instructions}`);
      doc.fillColor("#334155").fontSize(11);
    });
  });
}
