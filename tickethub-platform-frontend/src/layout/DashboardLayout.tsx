import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";

import { AppSidebar } from "@/components/sections/Dashboard/app-sidebar";
import { RoleSwitcher } from "@/components/shared/RoleSwitcher";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import type { Role } from "@/misc/dashboardData";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { ThemeProvider } from "@/components/shared/Theme/ThemeContext";
import { DashboardDateRangeProvider } from "@/components/shared/date/DashboardDateRangeProvider";
import { DateRangeFilter } from "@/components/shared/date/DateRangeFilter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalyticsOverviewFiltersProvider } from "@/components/sections/Dashboard/Organizer/Analytics/AnalyticsOverviewFiltersProvider";
import EventSelectDropdown from "@/components/sections/Dashboard/Organizer/Shared/EventSelectDropdown";
import TicketTypeFilter from "@/components/sections/Dashboard/Organizer/Analytics/TicketTypeFilter";
import { useAnalyticsOverviewFilters } from "@/components/sections/Dashboard/Organizer/Analytics/useAnalyticsOverviewFilters";

function HeaderAnalyticsFilters({ pathname }: { pathname: string }) {
  const { activeRole } = useAuthStorage();
  const { eventId, ticketId, setEventId, setTicketId } =
    useAnalyticsOverviewFilters();

  if (pathname !== "/organizer/analytics/overview") return null;
  if (activeRole !== "organizer") return null;

  return (
    <div className="hidden lg:flex items-center gap-2">
      <EventSelectDropdown value={eventId} onChange={setEventId} />
      <TicketTypeFilter
        value={ticketId}
        onChange={setTicketId}
        eventId={eventId ? Number(eventId) : undefined}
      />
    </div>
  );
}

function dashboardRoleFromPath(pathname: string): Role | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/event-staff")) return "event_staff";
  if (pathname.startsWith("/organizer")) return "organizer";
  return null;
}

export default function DashboardLayout() {
  const { roles, activeRole, setActiveRole } = useAuthStorage();
  const { pathname } = useLocation();

  useEffect(() => {
    const role = dashboardRoleFromPath(pathname);
    if (role) {
      const userRoles = roles as Role[];
      if (userRoles.includes(role) && activeRole !== role) {
        setActiveRole(role);
      }
    }
  }, [pathname, activeRole, roles, setActiveRole]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme-dashboard">
      <TooltipProvider>
        <DashboardDateRangeProvider>
          <SidebarProvider>
            <AppSidebar />
            <AnalyticsOverviewFiltersProvider>
              <SidebarInset>
                <header className="flex h-12 shrink-0 items-center justify-between md:gap-4 border-b border-border md:px-4">
                  <div className="flex items-center gap-1">
                    <SidebarTrigger className="md:-ml-1" />
                    <HeaderAnalyticsFilters pathname={pathname} />
                  </div>
                  <div className="flex items-center gap-1 mx-2">
                    <RoleSwitcher className="bg-muted border-border" />
                    {activeRole !== "attendee" && <DateRangeFilter />}
                    <ThemeToggle />
                  </div>
                </header>
                <div className="grid gap-4 p-4">
                  <Outlet />
                </div>
              </SidebarInset>
            </AnalyticsOverviewFiltersProvider>
          </SidebarProvider>
        </DashboardDateRangeProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
