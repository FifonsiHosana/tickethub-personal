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

/**
 * Main organizer dashboard service
 */
export async function getOrganizerDashboard(organizerId: number) {
  const [statistics, upcomingEvents, recentSales, topSellingEvents] =
    await Promise.all([
      getOrganizerStatistics(organizerId),
      getUpcomingEvents(organizerId),
      getRecentSales(organizerId),
      getTopSellingEvents(organizerId),
    ]);

  return {
    statistics,
    upcomingEvents,
    recentSales,
    topSellingEvents,
  };
}

/**
 * Dashboard statistic cards — composed from shared queries
 */
async function getOrganizerStatistics(organizerId: number) {
  const [
    eventCounts,
    ticketsSold,
    ticketsRemaining,
    checkIns,
    totalRevenue,
    conversion,
  ] = await Promise.all([
    getEventCountsByStatus(organizerId),
    getTicketsSold(organizerId),
    getTicketsRemaining(organizerId),
    getCheckInCount(organizerId),
    getTotalRevenue(organizerId),
    getConversionRate(organizerId),
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
