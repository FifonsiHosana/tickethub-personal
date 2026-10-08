import * as React from "react";
import {
  CalendarIcon,
  BarChart3Icon,
  HistoryIcon,
  ListChecksIcon,
  ShieldCheckIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  Mailbox,
  ScanLineIcon,
  UsersIcon,
  MoreHorizontalIcon,
} from "lucide-react";

export type Role = "organizer" | "event_staff" | "admin" | "attendee";

export type NavItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  activePaths?: string[];
  activePrefixes?: string[];
};

const ticketOrderHistoryNavItem: NavItem = {
  title: "Ticket Order History",
  url: "/ticket-order-history",
  icon: <HistoryIcon />,
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
    activePrefixes: ["/organizer/events"],
  },
  // {
  //   title: "Ticket Orders",
  //   url: "/organizer/orders",
  //   icon: <TicketIcon />,
  // },
  {
    title: "Scan",
    url: "/organizer/scan",
    icon: <ScanLineIcon />,
  },
  {
    title: "SMS",
    url: "/organizer/sms",
    icon: <Mailbox />,
    activePaths: ["/organizer/sms"],
  },
  {
    title: "Staff",
    url: "/organizer/staff",
    icon: <UsersIcon />,
  },
  {
    title: "Analytics",
    url: "/organizer/analytics",
    icon: <BarChart3Icon />,
    activePaths: ["/organizer/analytics"],
  },
  {
    title: "More",
    url: "/organizer/more",
    icon: <MoreHorizontalIcon />,
    activePaths: [
      "/organizer/more",
      "/organizer/sales",
      "/organizer/sales/analytics",
      "/organizer/analytics/events",
      "/organizer/analytics/revenue",
      "/organizer/analytics/tickets",
      "/organizer/sms/history",
      "/organizer/sms/credits",
      "/organizer/payout-settings",
      "/ticket-order-history",
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
  ticketOrderHistoryNavItem,
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
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: <BarChart3Icon />,
  },
  {
    title: "Platform Settings",
    url: "/admin/settings",
    icon: <SettingsIcon />,
  },
  ticketOrderHistoryNavItem,
];

const attendeeNav: NavItem[] = [ticketOrderHistoryNavItem];

export const navByRole: Record<Role, NavItem[]> = {
  organizer: organizerNav,
  event_staff: eventStaffNav,
  admin: platformAdminNav,
  attendee: attendeeNav,
};
