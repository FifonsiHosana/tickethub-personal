import * as React from "react";
import {
  CalendarIcon,
  TicketIcon,
  BarChart3Icon,
  ListChecksIcon,
  ShieldCheckIcon,
  SettingsIcon,
  PercentIcon,
  WalletIcon,
  LayoutDashboardIcon,
  UserCheckIcon,
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
    url: "/organizer/dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Events",
    url: "/organizer/events",
    icon: <CalendarIcon />,
    items: [
      { title: "All Events", url: "/organizer/events" },
      { title: "Create Event", url: "/organizer/events/new" },
    ],
  },
  {
    title: "Tickets",
    url: "/organizer/tickets",
    icon: <TicketIcon />,
    items: [
      { title: "Ticket Types", url: "/organizer/tickets" },
      { title: "Ticket Sales", url: "/organizer/sales" },
    ],
  },
  {
    title: "Attendees",
    url: "/organizer/attendees",
    icon: <UserCheckIcon />,
    items: [
      { title: "Event Staff", url: "/organizer/attendees/staff" },
    ],
  },
  {
    title: "Analytics",
    url: "/organizer/analytics/events",
    icon: <BarChart3Icon />,
    items: [
      { title: "Event Performance", url: "/organizer/analytics/events" },
      { title: "Revenue & Payouts", url: "/organizer/analytics/revenue" },
      { title: "Ticket Performance", url: "/organizer/analytics/tickets" },
    ],
  },
];

const eventStaffNav: NavItem[] = [
  {
    title: "All Attendees",
    url: "/event-staff/attendees",
    icon: <ListChecksIcon />,
    isActive: true,
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
