import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Home } from "lucide-react";

import { AppSidebar } from "@/components/sections/Dashboard/app-sidebar";
import { RoleSwitcher } from "@/components/shared/RoleSwitcher";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Role } from "@/misc/dashboardData";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { CreateEventButton } from "@/components/shared/CreateEventButton";
import { ThemeProvider } from "@/components/shared/Theme/ThemeContext";
import { DashboardDateRangeProvider } from "@/components/shared/date/DashboardDateRangeProvider";
import { DashboardEventFilterProvider } from "@/components/shared/date/DashboardEventFilterProvider";
import { DashboardEventFilter } from "@/components/shared/date/DashboardEventFilter";
import { useDashboardEventFilter } from "@/components/shared/date/useDashboardEventFilter";
import { DateRangeFilter } from "@/components/shared/date/DateRangeFilter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalyticsOverviewFiltersProvider } from "@/components/sections/Dashboard/Organizer/Analytics/AnalyticsOverviewFiltersProvider";
import TicketTypeFilter from "@/components/sections/Dashboard/Organizer/Analytics/TicketTypeFilter";
import { useAnalyticsOverviewFilters } from "@/components/sections/Dashboard/Organizer/Analytics/useAnalyticsOverviewFilters";
import SmsProgress from "@/components/shared/SmsProgress";

function HeaderAnalyticsFilters({ pathname }: { pathname: string }) {
  const { activeRole } = useAuthStorage();
  const { ticketId, setTicketId } = useAnalyticsOverviewFilters();
  const { eventIdNumber } = useDashboardEventFilter();

  if (pathname !== "/organizer/analytics") return null;
  if (activeRole !== "organizer") return null;

  return (
    <div className="hidden lg:flex items-center gap-2">
      <TicketTypeFilter
        value={ticketId}
        onChange={setTicketId}
        eventId={eventIdNumber}
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
  const { isMobile } = useIsMobile();

  useEffect(() => {
    const role = dashboardRoleFromPath(pathname);
    if (role) {
      const userRoles = roles as Role[];
      if (userRoles.includes(role) && activeRole !== role) setActiveRole(role);
    }
  }, [pathname, activeRole, roles, setActiveRole]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme-dashboard">
      <TooltipProvider>
        <DashboardDateRangeProvider>
          <DashboardEventFilterProvider>
            <SidebarProvider>
              <AppSidebar />
              <AnalyticsOverviewFiltersProvider>
                <SidebarInset>
                  <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border px-2 md:gap-4 md:px-4">
                    <div className="flex min-w-0 items-center gap-2">
                      {isMobile ? (
                        <Button variant="outline" size="icon-sm" render={<Link to="/home"><Home className="h-4 w-4" /></Link>} />
                      ) : (
                        <SidebarTrigger className="md:-ml-1" />
                      )}
                      {activeRole === "organizer" && <DashboardEventFilter />}
                      <HeaderAnalyticsFilters pathname={pathname} />
                    </div>
                    <div className="flex min-w-0 items-center gap-2">
                      <SmsProgress />
                      <RoleSwitcher className="bg-muted border-border" />
                      {activeRole !== "attendee" && <DateRangeFilter />}
                      <CreateEventButton />
                      <ThemeToggle />
                    </div>
                  </header>
                  <div className={`grid gap-4 ${isMobile ? `p-1 pb-[calc(7rem+env(safe-area-inset-bottom))]` : `p-4`}`}>
                    <Outlet />
                  </div>
                </SidebarInset>
              </AnalyticsOverviewFiltersProvider>
            </SidebarProvider>
          </DashboardEventFilterProvider>
        </DashboardDateRangeProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
