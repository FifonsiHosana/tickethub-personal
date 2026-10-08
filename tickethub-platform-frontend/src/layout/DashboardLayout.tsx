import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { ChevronRight, Home } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      if (userRoles.includes(role) && activeRole !== role) {
        setActiveRole(role);
      }
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
                  <header className="flex h-12 shrink-0 items-center justify-between md:gap-4 border-b border-border md:px-4">
                    <div className="flex items-center gap-1">
                      {isMobile ? (
                        <div className="p-2">
                          <Button variant="outline">
                            <Link to="/home">
                              <Home className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <>
                          <SidebarTrigger className="md:-ml-1" />
                          <div className="flex items-center gap-2">
                            <div className="inline-flex items-center text-sm font-medium text-muted-foreground gap-1">
                              Event <ChevronRight className="h-4 w-4" />
                            </div>
                            <div className="min-w-[200px]">
                              <Select
                                value="Omr sterling Live second event"
                                onValueChange={(value) => {
                                  if (!value) return;
                                  // setEventId(value === "all" ? "" : value);
                                }}
                              >
                                <SelectTrigger
                                  className="w-full"
                                  aria-label="Filter dashboard by event"
                                >
                                  <SelectValue placeholder="All events" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">
                                    All events
                                  </SelectItem>
                                  {/* {events.map((event) => (
          <SelectItem key={event.id} value={String(event.id)}>
            {event.title}
          </SelectItem>
        ))} */}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </>
                      )}
                      <HeaderAnalyticsFilters pathname={pathname} />
                    </div>
                    <div className="flex items-center gap-2 mx-2">
                      <SmsProgress />
                      <RoleSwitcher className="bg-muted border-border" />
                      {activeRole !== "attendee" && <DateRangeFilter />}
                      {activeRole === "organizer" && <DashboardEventFilter />}
                      <CreateEventButton />
                      <ThemeToggle />
                    </div>
                  </header>
                  <div
                    className={`grid gap-4 ${isMobile ? `p-1 pb-[calc(7rem+env(safe-area-inset-bottom))]` : `p-4`}`}
                  >
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
