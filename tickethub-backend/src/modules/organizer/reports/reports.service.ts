import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

import {
  payments,
  ticketOrders,
  ticketOrderItems,
  ticketOrderUserDetails,
  eventTickets,
  tickets,
  events,
} from '@/db/schema/index.js';

import { db } from '@/db/client.js';

import { and, eq, between, desc } from 'drizzle-orm';

type SalesReportOptions = {
  organizerId: number;

  format: 'pdf' | 'excel';

  eventId?: number | undefined;

  from?: string | undefined;

  to?: string | undefined;
}

async function getSalesReportData(options: SalesReportOptions) {
  const filters = [
    eq(events.organizerId, options.organizerId),

    eq(payments.status, 'Completed'),
  ];

  if (options.eventId) {
    filters.push(eq(events.id, options.eventId));
  }

  if (options.from && options.to) {
    filters.push(between(payments.paidAt, options.from, options.to));
  }

  return await db
    .select({
      orderId: ticketOrders.id,

      customer: ticketOrderUserDetails.firstName,

      surname: ticketOrderUserDetails.lastName,

      email: ticketOrderUserDetails.email,

      event: events.title,

      ticket: tickets.name,

      quantity: ticketOrders.quantity,

      amount: payments.amount,

      currency: payments.currency,

      paymentReference: payments.reference,

      paidAt: payments.paidAt,
    })

    .from(payments)

    .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))

    .innerJoin(
      ticketOrderUserDetails,
      eq(ticketOrders.id, ticketOrderUserDetails.orderId),
    )

    .innerJoin(ticketOrderItems, eq(ticketOrders.id, ticketOrderItems.orderId))

    .innerJoin(
      eventTickets,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )

    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))

    .innerJoin(events, eq(tickets.eventId, events.id))

    .where(and(...filters))

    .orderBy(desc(payments.paidAt));
}

async function generateExcelSalesReport(data: any[]) {
  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet('Sales Report');

  worksheet.columns = [
    {
      header: 'Order ID',
      key: 'orderId',
      width: 15,
    },

    {
      header: 'Customer',
      key: 'customer',
      width: 20,
    },

    {
      header: 'Surname',
      key: 'surname',
      width: 20,
    },

    {
      header: 'Email',
      key: 'email',
      width: 30,
    },

    {
      header: 'Event',
      key: 'event',
      width: 30,
    },

    {
      header: 'Ticket',
      key: 'ticket',
      width: 20,
    },

    {
      header: 'Quantity',
      key: 'quantity',
      width: 12,
    },

    {
      header: 'Amount',
      key: 'amount',
      width: 15,
    },

    {
      header: 'Currency',
      key: 'currency',
      width: 10,
    },

    {
      header: 'Payment Reference',
      key: 'paymentReference',
      width: 30,
    },

    {
      header: 'Paid At',
      key: 'paidAt',
      width: 25,
    },
  ];

  data.forEach((sale) => {
    worksheet.addRow({
      orderId: sale.orderId,

      customer: sale.customer,

      surname: sale.surname,

      email: sale.email,

      event: sale.event,

      ticket: sale.ticket,

      quantity: sale.quantity,

      amount: sale.amount,

      currency: sale.currency,

      paymentReference: sale.paymentReference,

      paidAt: sale.paidAt,
    });
  });

  worksheet.getRow(1).font = {
    bold: true,
  };

  return await workbook.xlsx.writeBuffer();
}

async function generatePdfSalesReport(data: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const document = new PDFDocument({
      margin: 40,
    });

    const chunks: Buffer[] = [];

    document.on('data', (chunk) => {
      chunks.push(chunk);
    });

    document.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    document.on('error', reject);

    document.fontSize(18).text('Sales Report', {
      align: 'center',
    });

    document.moveDown();

    data.forEach((sale, index) => {
      document.fontSize(11).text(
        `
${index + 1}. Order #${sale.orderId}

Customer:
${sale.customer} ${sale.surname}

Email:
${sale.email}

Event:
${sale.event}

Ticket:
${sale.ticket}

Quantity:
${sale.quantity}

Amount:
${sale.amount} ${sale.currency}

Payment Reference:
${sale.paymentReference}

Paid At:
${sale.paidAt}

----------------------------------
`,
      );
    });

    document.end();
  });
}

export async function generateSalesReport(options: SalesReportOptions) {
  const data = await getSalesReportData(options);

  if (options.format === 'excel') {
    return {
      buffer: await generateExcelSalesReport(data),

      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

      filename: 'sales-report.xlsx',
    };
  }

  return {
    buffer: await generatePdfSalesReport(data),

    contentType: 'application/pdf',

    filename: 'sales-report.pdf',
  };
}
