import type { Request, Response, NextFunction } from 'express';

import { generateSalesReport } from './reports.service.js';
import type { SalesReportQuery } from './reports.schema.js';

// reports.controller.ts
export async function exportSalesReport(
  req: Request<{}, {}, {}, SalesReportQuery>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { format, eventId, from, to } = req.query;

    const report = await generateSalesReport({
      organizerId: req.user.id,
      format,
      eventId: eventId,
      from,
      to,
    });

    res.setHeader('Content-Type', report.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${report.filename}"`,
    );
    res.status(200).send(report.buffer);
  } catch (error) {
    next(error);
  }
}
