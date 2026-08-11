import type { Role } from "@/misc/dashboardData";

type NavLink = {
  name: string;
  path: string;
  roles?: Role[];
  authRequired?: boolean;
};

export const navLinks: NavLink[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    roles: ["organizer", "admin", "event_staff"],
  },
  {
    name: "Ticket History",
    path: "/ticket-order-history",
    authRequired: true,
  },
  { name: "Home", path: "/" },
  { name: "The Events", path: "/events" },
  { name: "Sell Tickets", path: "/sell-event-tickets" },
];
