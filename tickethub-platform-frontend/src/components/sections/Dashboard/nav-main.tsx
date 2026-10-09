import { Link, useLocation } from "react-router";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { type NavItem } from "@/misc/dashboardData";

function isNavItemActive(item: NavItem, pathname: string) {
  const exactPaths = item.activePaths ?? [item.url];
  const exactMatch = exactPaths.some((path) => pathname === path);
  const prefixMatch = item.activePrefixes?.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  return exactMatch || Boolean(prefixMatch);
}

export function NavMain({ items }: { items: NavItem[] }) {
  const { pathname } = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              className="gap-x-3 mb-0.5"
              size="md"
              tooltip={item.title}
              isActive={isNavItemActive(item, pathname)}
              render={<Link to={item.url} />}
            >
              {item.icon}
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
