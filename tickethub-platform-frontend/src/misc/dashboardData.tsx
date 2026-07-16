import * as React from "react";
import {
  CalendarIcon,
  TicketIcon,
  UsersIcon,
  ScanLineIcon,
  BarChart3Icon,
  FileTextIcon,
  ClipboardCheckIcon,
  ListChecksIcon,
  ShieldCheckIcon,
  SettingsIcon,
  PercentIcon,
  WalletIcon,
  LayoutDashboardIcon,
} from "lucide-react";

export type Role = "organizer" | "event_staff" | "admin";

export type NavItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

const organizerNav: NavItem[] = [
  {
    title: "Dashboard",
    url: "/organizer",
    icon: <LayoutDashboardIcon />,
    isActive: true,
  },
  {
    title: "Events",
    url: "/organizer/events",
    icon: <CalendarIcon />,
    items: [
      { title: "All Events", url: "/organizer/events" },
      { title: "Create Event", url: "/organizer/events/new" },
      { title: "Tickets", url: "/organizer/events/tickets" },
    ],
  },
  {
    title: "Event Staff",
    url: "/organizer/staff",
    icon: <UsersIcon />,
  },
  {
    title: "Scan Tickets",
    url: "/organizer/scan",
    icon: <ScanLineIcon />,
  },
  {
    title: "Sales",
    url: "/organizer/sales",
    icon: <TicketIcon />,
    items: [
      { title: "Ticket Sales", url: "/organizer/sales" },
      { title: "Sales Analytics", url: "/organizer/sales/analytics" },
    ],
  },
  {
    title: "Analytics",
    url: "/organizer/analytics",
    icon: <BarChart3Icon />,
    items: [
      { title: "Revenue & Payouts", url: "/organizer/analytics/revenue" },
      { title: "Ticket Performance", url: "/organizer/analytics/tickets" },
      { title: "Event Overview", url: "/organizer/analytics/events" },
    ],
  },
  {
    title: "Reports",
    url: "/organizer/reports",
    icon: <FileTextIcon />,
  },
];

const eventStaffNav: NavItem[] = [
  {
    title: "Scan Ticket",
    url: "/staff/scan",
    icon: <ScanLineIcon />,
    isActive: true,
  },
  {
    title: "Check-In",
    url: "/staff/checkin",
    icon: <ClipboardCheckIcon />,
  },
  {
    title: "Attendee List",
    url: "/staff/attendees",
    icon: <ListChecksIcon />,
  },
];

const platformAdminNav: NavItem[] = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: <LayoutDashboardIcon />,
    isActive: true,
  },
  {
    title: "Organizers",
    url: "/admin/organizers",
    icon: <ShieldCheckIcon />,
    items: [
      { title: "All Organizers", url: "/admin/organizers" },
      { title: "Verification Queue", url: "/admin/organizers/verify" },
    ],
  },
  {
    title: "Events",
    url: "/admin/events",
    icon: <CalendarIcon />,
    items: [
      { title: "All Events", url: "/admin/events" },
      { title: "Approval Queue", url: "/admin/events/approvals" },
    ],
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: <BarChart3Icon />,
  },
  {
    title: "Commissions",
    url: "/admin/commissions",
    icon: <PercentIcon />,
  },
  {
    title: "Payouts & Settlements",
    url: "/admin/payouts",
    icon: <WalletIcon />,
  },
  {
    title: "Platform Settings",
    url: "/admin/settings",
    icon: <SettingsIcon />,
  },
];

export const navByRole: Record<Role, NavItem[]> = {
  organizer: organizerNav,
  event_staff: eventStaffNav,
  admin: platformAdminNav,
};
