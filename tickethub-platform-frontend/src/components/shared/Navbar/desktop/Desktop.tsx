import { NavLink } from "react-router";
import {
  History,
  Link,
  Menu,
  Settings,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
// import { Avatar } from "@/components/ui/avatar";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { UserNavMenu } from "./UserAvatar";
// import { UserAvatar } from "./UserAvatar";UserNavMenu
// import { RoleSwitcher } from "@/components/shared/RoleSwitcher";

type NavItem = {
  name: string;
  path: string;
};

type Props = {
  links: NavItem[];
  isAuthenticated: boolean;
  showCreateEvent: boolean;
  isUpgrading: boolean;
  isOpen: boolean;
  onToggleMenu: () => void;
  onSignInOrOut: () => void;
  onCreateEvent: () => void;
};

export default function Desktop({
  links,
  isAuthenticated,
  showCreateEvent,
  isUpgrading,
  isOpen,
  onToggleMenu,
  onSignInOrOut,
  onCreateEvent,
}: Props) {
  const { user, logout } = useAuthStorage();
  return (
    <>
      {/* Desktop Center Links */}
      <ul className="hidden lg:flex items-center gap-8 text-sm font-medium">
        {links.map((link) => (
          <li key={link.name}>
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                isActive ? "text-white" : "hover:text-primary transition-colors"
              }
            >
              {link.name}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Desktop CTA plus the hamburger Toggle */}
      <div className="flex items-center gap-2">
        {/* <RoleSwitcher className="hidden md:flex bg-white/10 border-white/15 text-white" /> */}
        <button
          onClick={onSignInOrOut}
          className="hidden lg:block px-8 py-2 text-sm font-medium text-white/90 border border-white/20 rounded-full hover:bg-white/10 hover:cursor-pointer"
        >
          {isAuthenticated ? "Log Out" : "Sign In"}
        </button>
        {showCreateEvent && (
          <button
            onClick={onCreateEvent}
            disabled={isUpgrading}
            className="hidden lg:block px-6 py-2 text-sm font-medium text-white bg-primary rounded-full hover:cursor-pointer disabled:opacity-60"
          >
            {isUpgrading ? "Upgrading..." : "Create Event"}
          </button>
        )}
        <button className="lg:hidden p-2 text-white" onClick={onToggleMenu}>
          {isOpen ? <X /> : <Menu />}
        </button>
        {user && (
          <UserNavMenu
            user={{
              name: `${user.firstName} ${user.lastName || ""}`.trim(),
              email: user.email,
              // avatarUrl: user.avatarUrl,
            }}
            items={[
              { label: "Dashboard", to: "/dashboard", icon: User },
              // { label: "Settings", to: "/settings", icon: Settings },
              {
                label: "Order History",
                to: "/ticket-order-history",
                icon: History,
              },
            ]}
          />
        )}
      </div>
    </>
  );
}
