import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import type { CompletedOrderRow } from './completed-orders.service.js';

export async function generateCompletedOrdersExcel(data: CompletedOrderRow[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Completed Orders');

  worksheet.columns = [
    { header: 'Order ID', key: 'orderId', width: 12 },
    { header: 'Buyer Name', key: 'buyerName', width: 24 },
    { header: 'Buyer Email', key: 'buyerEmail', width: 30 },
    { header: 'Buyer Phone', key: 'buyerPhone', width: 18 },
    { header: 'Organizer', key: 'organizerName', width: 24 },
    { header: 'Organizer Email', key: 'organizerEmail', width: 30 },
    { header: 'Events', key: 'eventSummary', width: 40 },
    { header: 'Tickets', key: 'ticketCount', width: 10 },
    { header: 'Amount', key: 'amount', width: 14 },
    { header: 'Fee Amount', key: 'feeAmount', width: 14 },
    { header: 'Provider', key: 'provider', width: 14 },
    { header: 'Reference', key: 'reference', width: 30 },
    { header: 'Currency', key: 'currency', width: 10 },
    { header: 'Paid At', key: 'paidAt', width: 24 },
  ];

  data.forEach((row) => worksheet.addRow(row));
  worksheet.getRow(1).font = { bold: true };

  return await workbook.xlsx.writeBuffer();
}

export async function generateCompletedOrdersPdf(
  data: CompletedOrderRow[],
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const document = new PDFDocument({ margin: 36, size: 'A4' });
    const chunks: Buffer[] = [];

    document.on('data', (chunk) => chunks.push(chunk));
    document.on('end', () => resolve(Buffer.concat(chunks)));
    document.on('error', reject);

    document.fontSize(18).text('Completed Orders', { align: 'center' });
    document.moveDown();

    data.forEach((row, index) => {
      document
        .fontSize(10)
        .text(
          `${index + 1}. Order #${row.orderId} | ${row.buyerName} | ${row.ticketCount} tickets`,
        )
        .text(`Events: ${row.eventSummary}`)
        .text(`Organizer: ${row.organizerName} (${row.organizerEmail})`)
        .text(`Amount: ${row.amount} ${row.currency} | Fee: ${row.feeAmount}`)
        .text(`Provider: ${row.provider} | Reference: ${row.reference}`)
        .text(`Paid At: ${row.paidAt ?? '-'}`)
        .moveDown(0.75);
    });

    document.end();
  });
}
