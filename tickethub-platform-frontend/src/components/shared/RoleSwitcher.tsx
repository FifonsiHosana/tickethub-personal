import { useLocation, useNavigate } from "react-router";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { navByRole, type Role } from "@/misc/dashboardData";

const ROLE_LABELS: Partial<Record<Role, string>> = {
  organizer: "Organizer",
  attendee: "Attendee",
  admin: "Admin",
  event_staff: "Event Staff",
};

type Props = {
  className?: string;
};

export function RoleSwitcher({ className }: Props = {}) {
  const { roles, activeRole, setActiveRole } = useAuthStorage();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (roles.length < 2) return null;

  function isUrlInRole(role: Role): boolean {
    const items = navByRole[role] ?? [];
    return items.some(
      (item) =>
        item.url === pathname ||
        item.items?.some((subItem) => subItem.url === pathname),
    );
  }

  function handleSwitch(role: Role) {
    setActiveRole(role);
    if (isUrlInRole(role)) return;
    navigate((navByRole[role] ?? [])[0]?.url ?? "/ticket-order-history");
  }

  return (
    <div
      className={
        `flex items-center gap-1 rounded-full p-1 text-xs font-medium border ${className ?? ""}`
      }
    >
      {roles.map((role) => {
        const label = ROLE_LABELS[role as Role] ?? role;
        const isActive = role === activeRole;

        return (
          <button
            key={role}
            type="button"
            onClick={() => handleSwitch(role as Role)}
            className={`px-3 py-1 rounded-full transition-colors hover:cursor-pointer ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}