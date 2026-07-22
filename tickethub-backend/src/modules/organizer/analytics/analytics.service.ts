import {
  getTotalRevenue,
  getRevenueTrend,
  getTicketsSold,
  getEventCountsByStatus,
  getEventPerformance,
  getTicketPerformance,
  getConversionRate,
} from '../queries/index.js';

export interface AnalyticsDateRange {
  from?: string | undefined;
  to?: string | undefined;
}

/**
 * Organizer dashboard overview cards
 */
export async function getOverviewAnalytics(organizerId: number) {
  const [totalRevenue, ticketsSold, eventCounts, conversion] =
    await Promise.all([
      getTotalRevenue(organizerId),
      getTicketsSold(organizerId),
      getEventCountsByStatus(organizerId),
      getConversionRate(organizerId),
    ]);

  return {
    totalRevenue,
    ticketsSold,
    totalOrders: conversion.totalOrders,
    totalEvents: eventCounts.totalEvents,
  };
}

export { getRevenueTrend, getEventPerformance, getTicketPerformance };
