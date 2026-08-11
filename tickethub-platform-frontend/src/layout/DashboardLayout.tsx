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
            <SidebarInset>
              <header className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-border px-4">
                <SidebarTrigger className="-ml-1" />
<div className="flex items-center gap-2">
                <RoleSwitcher className="bg-muted border-border" />
                {activeRole !== "attendee" && <DateRangeFilter />}
                <ThemeToggle />
              </div>
              </header>
              <div className="flex flex-1 flex-col gap-4 p-4">
                <Outlet />
              </div>
            </SidebarInset>
          </SidebarProvider>
        </DashboardDateRangeProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
