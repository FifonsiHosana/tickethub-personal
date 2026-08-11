import { type DateRange } from '@/utils/dateRange.js';
import {
  getTotalRevenue,
  getRevenueTrend,
  getTicketsSold,
  getCheckInCount,
  getTicketsRemaining,
  getEventCountsByStatus,
  getUpcomingEvents,
  getTopSellingEvents,
  getRecentSales,
  getConversionRate,
} from '../queries/index.js';

export interface DashboardPaginationParams {
  upcomingPage?: number;
  upcomingPageSize?: number;
  topSellingPage?: number;
  topSellingPageSize?: number;
  from?: string;
  to?: string;
}

/**
 * Main organizer dashboard service
 */
export async function getOrganizerDashboard(
  organizerId: number,
  params: DashboardPaginationParams = {},
) {
  const upcomingPage = params.upcomingPage ?? 1;
  const upcomingPageSize = params.upcomingPageSize ?? 5;
  const topSellingPage = params.topSellingPage ?? 1;
  const topSellingPageSize = params.topSellingPageSize ?? 5;
  const range: DateRange = { from: params.from, to: params.to };

  const [statistics, upcomingEvents, recentSales, topSellingEvents] =
    await Promise.all([
      getOrganizerStatistics(organizerId, range),
      getUpcomingEvents(organizerId, upcomingPage, upcomingPageSize),
      getRecentSales(organizerId, 5, range),
      getTopSellingEvents(
        organizerId,
        topSellingPage,
        topSellingPageSize,
        range,
      ),
    ]);

  return {
    statistics,
    upcomingEvents: upcomingEvents.data,
    upcomingPagination: upcomingEvents.pagination,
    recentSales,
    topSellingEvents: topSellingEvents.data,
    topSellingPagination: topSellingEvents.pagination,
  };
}

/**
 * Dashboard statistic cards — composed from shared queries
 */
async function getOrganizerStatistics(
  organizerId: number,
  range?: DateRange,
) {
  const [
    eventCounts,
    ticketsSold,
    ticketsRemaining,
    checkIns,
    totalRevenue,
    conversion,
  ] = await Promise.all([
    getEventCountsByStatus(organizerId),
    getTicketsSold(organizerId, range),
    getTicketsRemaining(organizerId),
    getCheckInCount(organizerId, range),
    getTotalRevenue(organizerId, range),
    getConversionRate(organizerId, range),
  ]);

  return {
    ...eventCounts,
    totalTicketsSold: ticketsSold,
    totalTicketsRemaining: ticketsRemaining,
    totalCheckIns: checkIns,
    totalRevenue,
    totalOrders: conversion.totalOrders,
    completedOrders: conversion.completedOrders,
    conversionRate: conversion.conversionRate,
  };
}

export { getRevenueTrend };
