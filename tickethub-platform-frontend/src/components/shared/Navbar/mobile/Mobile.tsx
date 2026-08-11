import { NavLink } from "react-router";
import { AnimatePresence, motion } from "motion/react";
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
  onCloseMenu: () => void;
  onSignInOrOut: () => void;
  onCreateEvent: () => void;
};

export default function Mobile({
  links,
  isAuthenticated,
  showCreateEvent,
  isUpgrading,
  isOpen,
  onCloseMenu,
  onSignInOrOut,
  onCreateEvent,
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="lg:hidden flex flex-col items-center gap-4 pb-6 pt-2 border-t border-white/10 w-full px-4"
        >
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={onCloseMenu}
              className={({ isActive }) =>
                `text-base font-medium ${
                  isActive
                    ? "text-white"
                    : "text-neutral-400 hover:text-white"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          {/* <RoleSwitcher className="bg-white/10 border-white/15 text-white" /> */}
          <button
            onClick={onSignInOrOut}
            className="mt-2 px-12 py-3 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/20 transition-colors"
          >
            {isAuthenticated ? "Log Out" : "Sign In"}
          </button>
          {showCreateEvent && (
            <button
              onClick={onCreateEvent}
              disabled={isUpgrading}
              className="mt-2 px-8 py-3 text-sm font-medium text-white bg-primary rounded-full hover:bg-white/20 transition-colors disabled:opacity-60"
            >
              {isUpgrading ? "Upgrading..." : "Create Event"}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}