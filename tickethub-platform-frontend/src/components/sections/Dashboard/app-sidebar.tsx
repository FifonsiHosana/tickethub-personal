import * as React from "react";
import { Link } from "react-router";
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
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { assets } from "@/assets/assets";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { useIsMobile } from "@/hooks/use-mobile";
import { navByRole, type Role } from "@/misc/dashboardData";
import { NavMobile } from "./nav-mobile";
import { PlusCircleIcon, Ticket } from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { activeRole, roles, user } = useAuthStorage();
  const userRoles = roles as Role[];
  const activeDashboardRole =
    activeRole && userRoles.includes(activeRole) ? activeRole : userRoles[0];
  const items = navByRole[activeDashboardRole as Role] ?? [];
  const { isMobile } = useIsMobile();

  if (isMobile) return <NavMobile items={items} />;

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {isMobile && (
              <SidebarMenuButton size="lg">
                <div className="flex h-full w-full justify-center">
                  <SidebarTrigger className="md:-ml-1" />
                </div>
              </SidebarMenuButton>
            )}
            <SidebarMenuButton size="lg" render={<Link to="/" />}>
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
            </SidebarMenuButton>
          </SidebarMenuItem>
          {activeDashboardRole === "organizer" && (
            <SidebarMenuItem className="flex flex-col md:flex-row gap-4 items-center md:justify-center w-full mt-5">
              <SidebarMenuButton
                size={"lg"}
                tooltip="Create Event"
                className="flex items-center justify-center gap-3 px-6 py-3 bg-primary text-white rounded-full font-medium hover:scale-105 hover:bg-primary/80 hover:cursor-pointer w-full md:w-auto transition-all"
                render={<Link to="/organizer/events/new" />}
              >
                <PlusCircleIcon />
                <span>Create Event</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarHeader>
      <div className="flex flex-col md:flex-row gap-4 items-center md:justify-center w-full">
        <button
        // onClick={() => navigate("/events")}
        ></button>
      </div>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>

      <SidebarFooter className="p-2 gap-2">
        <SidebarMenuItem className="list-none">
          <SidebarMenuButton
            size={"lg"}
            className="w-full justify-between font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <a
              href="/tickets"
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md"
            >
              <span>My Tickets</span>
              <Ticket className="h-4 w-4 -rotate-45 text-muted-foreground group-hover:text-foreground transition-transform" />
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
