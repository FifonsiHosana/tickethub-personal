import { type DateRange } from '@/utils/dateRange.js';
import {
  getTotalRevenue,
  getRevenueTrend,
  getTicketsSold,
  getEventCountsByStatus,
  getEventPerformance,
  getTicketPerformance,
  getConversionRate,
} from '../queries/index.js';

export type AnalyticsDateRange = DateRange;

/**
 * Organizer dashboard overview cards
 */
export async function getOverviewAnalytics(
  organizerId: number,
  range?: DateRange,
) {
  const [totalRevenue, ticketsSold, eventCounts, conversion] =
    await Promise.all([
      getTotalRevenue(organizerId, range),
      getTicketsSold(organizerId, range),
      getEventCountsByStatus(organizerId),
      getConversionRate(organizerId, range),
    ]);

  return {
    totalRevenue,
    ticketsSold,
    totalOrders: conversion.totalOrders,
    totalEvents: eventCounts.totalEvents,
  };
}

export { getRevenueTrend, getEventPerformance, getTicketPerformance };
