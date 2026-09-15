import XLSX from 'xlsx-js-style';
import { ZfocEntry } from '../types';

export function downloadExcel(entries: ZfocEntry[], fileNameBase: string): string {
  if (entries.length === 0) {
    throw new Error('No sheets to export.');
  }

  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title: 'Daikin ZFOC Form',
    Subject: 'Zero Free Of Cost Claim',
    Author: 'Made By Rizwan Shaikh @2026',
    Company: 'Made By Rizwan Shaikh @2026',
    Comments: 'Made By Rizwan Shaikh @2026',
  };

  const thin = { style: 'thin', color: { rgb: '000000' } };
  const allBorders = { top: thin, bottom: thin, left: thin, right: thin };
  const baseStyle = {
    font: { name: 'Arial', sz: 11, color: { rgb: '000000' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: allBorders,
  };

  entries.forEach((entry) => {
    const d = entry.fields;
    const rows: (string | number)[][] = [
      [entry.name, ''],
      ['', ''],
      ['Order Type', d.orderType || ''],
      ['Customer Name', d.customerName || ''],
      ['SSD/ASP Name', d.aspName || ''],
      ['Dealer/ASP Address', d.aspAddress || ''],
      ['Machine Model Number', d.modelNumber || ''],
      ['Serial No.', d.serialNo || ''],
      ['Daikin Invoice No.', d.invoiceNo || ''],
      ['Invoice Date', d.invoiceDate || ''],
      ['Nature of Defective', d.natureDefective || ''],
      ['Part Code & Name', d.partCodeName || ''],
      ['Quantity Required', d.quantity || ''],
      ['Reason', d.reason || ''],
    ];

    // 12 Spacing rows
    for (let i = 0; i < 12; i++) rows.push(['', '']);

    // Copyright Row
    const copyrightRowIdx = rows.length;
    rows.push(['Made By Rizwan Shaikh @2026', '']);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 34 }, { wch: 64 }];
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
      { s: { r: copyrightRowIdx, c: 0 }, e: { r: copyrightRowIdx, c: 1 } },
    ];

    for (let r = 2; r <= 13; r++) {
      for (let c = 0; c <= 1; c++) {
        const ref = XLSX.utils.encode_cell({ r, c });
        if (!ws[ref]) ws[ref] = { t: 's', v: '' };
        (ws[ref] as any).s = { ...baseStyle };
      }
    }
    for (let r = 2; r <= 13; r++) {
      const ref = XLSX.utils.encode_cell({ r, c: 0 });
      (ws[ref] as any).s = {
        ...baseStyle,
        font: { name: 'Arial', sz: 11, bold: false, color: { rgb: '000000' } },
        alignment: { horizontal: 'left', vertical: 'center' },
      };
    }
    for (let r = 2; r <= 13; r++) {
      const ref = XLSX.utils.encode_cell({ r, c: 1 });
      (ws[ref] as any).s = {
        ...baseStyle,
        font: { name: 'Arial', sz: 11, bold: false, color: { rgb: '000000' } },
        alignment: { horizontal: 'left', vertical: 'center' },
      };
    }
    // Yellow highlight for Order Type row (Row 2 in 0-indexed)
    for (let c = 0; c <= 1; c++) {
      const ref = XLSX.utils.encode_cell({ r: 2, c });
      (ws[ref] as any).s = {
        ...baseStyle,
        fill: { patternType: 'solid', fgColor: { rgb: 'FFFF00' } },
        font: { name: 'Arial', sz: 11, bold: false, color: { rgb: '000000' } },
        alignment: { horizontal: 'left', vertical: 'center' },
      };
    }
    (ws['A1'] as any).s = {
      font: { name: 'Arial', sz: 14, bold: false, color: { rgb: '000000' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };

    // Spacing rows styling
    for (let r = 14; r < copyrightRowIdx; r++) {
      for (let c = 0; c <= 1; c++) {
        const ref = XLSX.utils.encode_cell({ r, c });
        if (ws[ref]) {
          (ws[ref] as any).s = { font: { name: 'Arial', sz: 11 }, alignment: { vertical: 'center' } };
        }
      }
    }

    // Copyright cell styling
    const cpRef = XLSX.utils.encode_cell({ r: copyrightRowIdx, c: 0 });
    if (ws[cpRef]) {
      (ws[cpRef] as any).s = {
        font: { name: 'Arial', sz: 9, italic: true, color: { rgb: '777777' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    }

    const sheetName = entry.name.replace(/[\[\]\:\*\?\/\\]/g, '_').substring(0, 31) || 'ZFOC';
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const base = (fileNameBase || 'ZFOC_Sheets').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'ZFOC_Sheets';
  const fileName = base + '.xlsx';
  XLSX.writeFile(wb, fileName, { bookType: 'xlsx', cellStyles: true });
  return fileName;
}
