import { jsPDF } from 'jspdf';
import { ZfocEntry } from '../types';

export function downloadPDF(entries: ZfocEntry[], fileNameBase: string): string {
  if (entries.length === 0) {
    throw new Error('No sheets to export.');
  }

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  pdf.setProperties({
    title: 'Daikin ZFOC Multi-Sheet',
    subject: 'Zero Free Of Cost Claim Form',
    author: 'Made By Rizwan Shaikh @2026',
    creator: 'Made By Rizwan Shaikh @2026',
  });

  const pageW = 210;
  const pageH = 297;
  const left = 15;
  const right = 15;
  const tableW = pageW - left - right;
  const col1 = 57;
  const col2 = tableW - col1;
  const rowH = 10;
  const titleY = 22;
  const tableY = titleY + 13 + 4;

  const fields: [string, keyof ZfocEntry['fields']][] = [
    ['Order Type', 'orderType'],
    ['Customer Name', 'customerName'],
    ['SSD/ASP Name', 'aspName'],
    ['Dealer/ASP Address', 'aspAddress'],
    ['Machine Model Number', 'modelNumber'],
    ['Serial No.', 'serialNo'],
    ['Daikin Invoice No.', 'invoiceNo'],
    ['Invoice Date', 'invoiceDate'],
    ['Nature of Defective', 'natureDefective'],
    ['Part Code & Name', 'partCodeName'],
    ['Quantity Required', 'quantity'],
    ['Reason', 'reason'],
  ];

  function cleanText(value: unknown): string {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
  }

  function fitText(textValue: string, maxWidth: number, fontSize: number, bold: boolean): string {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(fontSize);
    let s = cleanText(textValue);
    if (pdf.getTextWidth(s) <= maxWidth) return s;
    while (s.length > 1 && pdf.getTextWidth(s + '…') > maxWidth) {
      s = s.slice(0, -1);
    }
    return s + '…';
  }

  function drawPage(entry: ZfocEntry, index: number, total: number) {
    if (index > 0) pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageW, pageH, 'F');
    pdf.setTextColor(20, 32, 45);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.text(cleanText(entry.name || 'ZFOC'), pageW / 2, 13, { align: 'center' });

    const totalRowsH = fields.length * rowH;
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.45);
    pdf.rect(left, tableY, tableW, totalRowsH);

    fields.forEach((field, i) => {
      const label = field[0];
      const key = field[1];
      const value = cleanText(entry.fields[key] || '');
      const y = tableY + i * rowH;

      if (i === 0) {
        pdf.setFillColor(255, 255, 0);
        pdf.rect(left, y, tableW, rowH, 'F');
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(left, y, tableW, rowH, 'F');
      }

      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.30);
      pdf.line(left, y, left + tableW, y);
      pdf.line(left + col1, y, left + col1, y + rowH);
      if (i === fields.length - 1) {
        pdf.line(left, y + rowH, left + tableW, y + rowH);
      }

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(i === 0 ? 9.5 : 9);
      const labelText = fitText(label, col1 - 6, i === 0 ? 9.5 : 9, false);
      pdf.text(labelText, left + 3, y + 6.5);

      pdf.setFont('helvetica', i === 0 ? 'bold' : 'normal');
      pdf.setFontSize(i === 0 ? 10 : 9);
      const valueText = fitText(value, col2 - 7, i === 0 ? 10 : 9, i === 0);
      pdf.text(valueText, left + col1 + 3, y + 6.5);
    });

    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.55);
    pdf.rect(left, tableY, tableW, totalRowsH);

    // Footer with Copyright & Page Number
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(100, 110, 125);
    pdf.text('Made By Rizwan Shaikh @2026', left, 286);
    pdf.text(`Page ${index + 1} of ${total}`, pageW - right, 286, { align: 'right' });
  }

  entries.forEach((entry, index) => drawPage(entry, index, entries.length));
  const base = (fileNameBase || 'ZFOC_Sheets').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'ZFOC_Sheets';
  const fileName = base + '.pdf';
  pdf.save(fileName);
  return fileName;
}
