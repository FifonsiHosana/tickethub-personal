import { useLocation, useNavigate } from "react-router";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { navByRole, type NavItem, type Role } from "@/misc/dashboardData";

const ROLE_LABELS: Partial<Record<Role, string>> = {
  organizer: "Organizer",
  attendee: "Attendee",
  admin: "Admin",
  event_staff: "Event Staff",
};

type Props = {
  className?: string;
};

function isNavItemActive(item: NavItem, pathname: string) {
  const exactPaths = item.activePaths ?? [item.url];
  const exactMatch = exactPaths.some((path) => pathname === path);
  const prefixMatch = item.activePrefixes?.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  return exactMatch || Boolean(prefixMatch);
}

export function RoleSwitcher({ className }: Props = {}) {
  const { roles, activeRole, setActiveRole } = useAuthStorage();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (roles.length < 2) return null;

  function isUrlInRole(role: Role): boolean {
    const items = navByRole[role] ?? [];
    return items.some((item) => isNavItemActive(item, pathname));
  }

  function handleSwitch(role: Role) {
    setActiveRole(role);
    if (isUrlInRole(role)) return;
    navigate((navByRole[role] ?? [])[0]?.url ?? "/ticket-order-history");
  }

  return (
    <div
      className={`flex items-center gap-1 rounded-full p-1 text-xs font-medium border ${className ?? ""}`}
    >
      {roles.map((role) => {
        const roleName = role as Role;
        const label = ROLE_LABELS[roleName] ?? role;
        const isActive = role === activeRole;

        return (
          <button
            key={role}
            type="button"
            onClick={() => handleSwitch(roleName)}
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

