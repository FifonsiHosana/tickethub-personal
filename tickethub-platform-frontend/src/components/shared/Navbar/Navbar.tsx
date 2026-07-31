import React, { useState } from "react";
import { NavLink } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/misc/navLinks";
import { assets } from "@/assets/assets";

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="absolute top-6 z-50 w-full px-4 flex flex-col items-center">
      <div
        className={`flex flex-col w-full max-w-4xl rounded-4xl bg-foreground text-white`}
      >
        <div className="flex items-center justify-between p-2 w-full">
          {/* The Logo Side */}
          <NavLink
            to="/"
            className="flex items-center gap-3 pl-4 pr-6"
            onClick={() => setIsOpen(false)}
          >
            <img
              src={assets.TicketHubLogo}
              className="object-contain"
              width={72}
              height={72}
            />
          </NavLink>

          {/* Desktop Center Links */}
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <li key={link.name}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    isActive
                      ? "text-white"
                      : "hover:text-primary transition-colors"
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop CTA plus the hamburger Toggle */}
          <div className="flex items-center pr-2 gap-2">
            <button
              onClick={() => navigate("/login")}
              className="hidden md:block px-6 py-2 text-sm font-medium text-white bg-primary/80 rounded-full hover:cursor-pointer"
            >
              Sign In
            </button>
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown Squad */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden flex flex-col items-center gap-4 pb-6 pt-2 border-t border-white/10 w-full"
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
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
              <button
                onClick={() => navigate("/login")}
                className="mt-2 px-8 py-3 text-sm font-medium text-white bg-primary/80 rounded-full hover:bg-white/20 transition-colors"
              >
                Sign In
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
