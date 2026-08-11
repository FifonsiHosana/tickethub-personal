import React, { useState } from "react";
import { NavLink } from "react-router";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { navLinks } from "@/misc/navLinks";
import { assets } from "@/assets/assets";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { useBecomeOrganizer } from "@/hooks/useAuth";
import Desktop from "./desktop/Desktop";
import Mobile from "./mobile/Mobile";
import type { Role } from "@/misc/dashboardData";

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { token, roles, setAuth, logout } = useAuthStorage();
  const { mutateAsync: upgradeToOrganizer, isPending: isUpgrading } =
    useBecomeOrganizer();

  const isAuthenticated = Boolean(token);
  const showCreateEvent = roles.length < 2;

  const visibleLinks = navLinks.filter(
    (link) =>
      (!link.authRequired || isAuthenticated) &&
      (!link.roles ||
        link.roles.some((role) => (roles as Role[]).includes(role))),
  );

  async function handleCreateEvent() {
    if (!token) {
      navigate("/signup");
      return;
    }

    if ((roles as Role[]).includes("organizer")) {
      navigate("/organizer/events/new");
      return;
    }

    try {
      const result = await upgradeToOrganizer();
      setAuth({
        token: result.data.token,
        user: result.data.user,
        activeRole: "organizer",
      });
      toast.success("You can now create events!");
      navigate("/organizer/events/new");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to upgrade your account.";
      toast.error(message);
    }
  }

  function handleSignInOrOut() {
    if (isAuthenticated) {
      logout();
    } else {
      navigate("/login");
    }
    setIsOpen(false);
  }

  return (
    <nav className="absolute top-0 z-50 w-full bg-foreground text-white">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex items-center justify-between py-2 px-4 w-full">
          {/* The Logo Side */}
          <NavLink
            to="/"
            className="flex items-center gap-3 pr-6"
            onClick={() => setIsOpen(false)}
          >
            <img
              src={assets.TicketHubLogo}
              className="object-contain"
              width={72}
              height={72}
            />
          </NavLink>

          <Desktop
            links={visibleLinks}
            isAuthenticated={isAuthenticated}
            showCreateEvent={showCreateEvent}
            isUpgrading={isUpgrading}
            isOpen={isOpen}
            onToggleMenu={() => setIsOpen(!isOpen)}
            onSignInOrOut={handleSignInOrOut}
            onCreateEvent={handleCreateEvent}
          />
        </div>

        <Mobile
          links={visibleLinks}
          isAuthenticated={isAuthenticated}
          showCreateEvent={showCreateEvent}
          isUpgrading={isUpgrading}
          isOpen={isOpen}
          onCloseMenu={() => setIsOpen(false)}
          onSignInOrOut={handleSignInOrOut}
          onCreateEvent={handleCreateEvent}
        />
      </div>
    </nav>
  );
};