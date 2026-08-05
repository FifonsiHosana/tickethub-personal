import type { Role } from "@/misc/dashboardData";

type NavLink = {
  name: string;
  path: string;
  roles?: Role[];
};

export const navLinks: NavLink[] = [
  { name: "Home", path: "/" },
  { name: "The Events", path: "/events" },
  { name: "Sell Tickets", path: "/sell-event-tickets" },
  { name: "Ticket Order History", path: "/ticket-order-history", roles: ["attendee"] },
];