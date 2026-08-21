import * as React from "react";
import {
  CalendarIcon,
  TicketIcon,
  BarChart3Icon,
  HistoryIcon,
  ListChecksIcon,
  ShieldCheckIcon,
  // WalletIcon,
  LayoutDashboardIcon,
  UserCheckIcon,
  SettingsIcon,
  Mailbox,
} from "lucide-react";
import { GiChatBubble } from "react-icons/gi";
import { FaLetterboxd } from "react-icons/fa6";

export type Role = "organizer" | "event_staff" | "admin" | "attendee";

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
    items: [{ title: "Event Staff", url: "/organizer/attendees/staff" }],
  },
  {
    title: "Analytics",
    url: "/organizer/analytics/overview",
    icon: <BarChart3Icon />,
    // items: [
    //   { title: "Analytics Overview", url: "/organizer/analytics/overview" },
    //   // { title: "Event Performance", url: "/organizer/analytics/events" },
    //   // { title: "Revenue & Payouts", url: "/organizer/analytics/revenue" },
    //   // { title: "Ticket Performance", url: "/organizer/analytics/tickets" },
    // ],
  },
  {
    title: "SMS",
    url: "/organizer/sms",
    icon: <Mailbox /> ,
    items: [
      { title: "SMS Campaign", url: "/organizer/sms" },
      { title: "SMS History", url: "/organizer/sms/history" },
      { title: "SMS Credits", url: "/organizer/sms/credits" },
    ],
  },
  // {
  //   title: "Payout Settings",
  //   url: "/organizer/payout-settings",
  //   icon: <BanknoteIcon />,
  // },
  ticketOrderHistoryNavItem,
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

  // {
  //   title: "Payouts & Settlements",
  //   url: "/admin/payouts",
  //   icon: <WalletIcon />,
  // },
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
