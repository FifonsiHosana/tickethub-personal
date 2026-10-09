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
import { NavMobile, type MoreNavItem } from "./nav-mobile";
import { PlusCircleIcon, TicketIcon, LogOutIcon } from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { activeRole, roles, user, logout } = useAuthStorage();
  const userRoles = roles as Role[];
  const activeDashboardRole =
    activeRole && userRoles.includes(activeRole) ? activeRole : userRoles[0];
  const items = navByRole[activeDashboardRole as Role] ?? [];
  const { isMobile } = useIsMobile();

  const moreItems: MoreNavItem[] = [
    {
      title: "Create New Event",
      url: "/organizer/events/new",
      icon: <PlusCircleIcon />,
    },
    {
      title: "My Tickets",
      url: "/ticket-order-history",
      icon: <TicketIcon />,
    },
    {
      title: "Logout",
      url: "#",
      icon: <LogOutIcon />,
      onClick: logout,
    },
  ];

  if (isMobile) return <NavMobile items={items} maxVisible={5} moreItems={moreItems} />;

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
            <>
              

              <SidebarMenuItem className="flex flex-col md:flex-row gap-4 items-center md:justify-center w-full mt-5">
              <SidebarMenuButton
                size="md"
                tooltip="My Tickets"
                className="h-11 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/60 font-medium text-sidebar-accent-foreground shadow-sm transition-colors hover:bg-sidebar-accent"
                render={<Link to="/organizer/events/new" />}
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <PlusCircleIcon />
                </div>
                <span>Create Event</span>
              </SidebarMenuButton></SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>

      <SidebarFooter className="gap-2 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="md"
              tooltip="My Tickets"
              className="h-11 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/60 font-medium text-sidebar-accent-foreground shadow-sm transition-colors hover:bg-sidebar-accent"
              render={<Link to="/ticket-order-history" />}
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TicketIcon className="h-4 w-4 -rotate-12" />
              </div>
              <span className="truncate">My Tickets</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

