import * as React from "react";
import { Link } from "react-router"; // Use "react-router-dom" if that's your package

import { NavMain } from "@/components/sections/Dashboard/nav-main";
import { NavUser } from "@/components/sections/Dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import { useAuthStorage } from "@/hooks/useAuthStorage";
import { navByRole, type Role } from "@/misc/dashboardData";
import { assets } from "@/assets/assets";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { activeRole, roles, user } = useAuthStorage();

  // Use the active role, or fall back to the user's first role.
  const userRoles = roles as Role[];
  const activeDashboardRole =
    activeRole && userRoles.includes(activeRole)
      ? activeRole
      : userRoles[0];

  const items = navByRole[activeDashboardRole as Role] ?? [];

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Link to="/">
                <div className="flex items-center gap-2">
                  <div className="flex size-12 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                    <img
                      src={assets.TicketHubLogo}
                      alt="Logo"
                      className="size-8 object-contain"
                    />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">TicketHub</span>
                    <span className="truncate text-xs capitalize">
                      {activeDashboardRole || "User"}
                    </span>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>

      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
