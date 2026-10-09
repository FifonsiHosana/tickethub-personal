import { type DateRange } from '@/utils/dateRange.js';
import {
  getTotalRevenue,
  getRevenueTrend,
  getTicketsSold,
  getCheckInCount,
  getTicketCapacityStats,
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
  eventId?: number;
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
  const filters = params.eventId ? { eventId: params.eventId } : undefined;

  const [statistics, upcomingEvents, recentSales, topSellingEvents] =
    await Promise.all([
      getOrganizerStatistics(organizerId, range, filters),
      getUpcomingEvents(organizerId, upcomingPage, upcomingPageSize, filters),
      getRecentSales(organizerId, 5, range, filters),
      getTopSellingEvents(
        organizerId,
        topSellingPage,
        topSellingPageSize,
        range,
        filters,
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
  filters?: { eventId?: number | undefined },
) {
  const [
    eventCounts,
    ticketCapacity,
    checkIns,
    totalRevenue,
    conversion,
  ] = await Promise.all([

    getEventCountsByStatus(organizerId, filters),
    getTicketCapacityStats(organizerId, filters),
    getCheckInCount(organizerId, range, filters),
    getTotalRevenue(organizerId, range, filters),
    getConversionRate(organizerId, range, filters),

  ]);

  return {
    ...eventCounts,
    totalTicketsAvailable: ticketCapacity.totalTicketsAvailable,
    totalTicketsSold: ticketCapacity.totalTicketsSold,
    totalTicketsRemaining: ticketCapacity.totalTicketsRemaining,
    totalCheckIns: checkIns,
    totalRevenue,
    totalOrders: conversion.totalOrders,
    completedOrders: conversion.completedOrders,
    conversionRate: conversion.conversionRate,
  };
}

export { getRevenueTrend };

