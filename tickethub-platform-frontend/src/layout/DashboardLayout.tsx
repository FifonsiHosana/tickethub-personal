import { Outlet } from "react-router";

import { AppSidebar } from "@/components/sections/Dashboard/app-sidebar";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { ThemeProvider } from "@/components/shared/Theme/ThemeContext";

export default function DashboardLayout() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <ThemeToggle />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
    </ThemeProvider>
  );
}
