"use client";

import * as React from "react";

import { NavMain } from "@/components/sections/Dashboard/nav-main";
import { NavUser } from "@/components/sections/Dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TicketIcon } from "lucide-react";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { navByRole, type Role } from "@/misc/dashboardData";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { role, user } = useAuthStorage();

  const items = navByRole[role as Role] ?? [];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <TicketIcon className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">TicketFlow</span>
            <span className="truncate text-xs capitalize">{role}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user!} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
