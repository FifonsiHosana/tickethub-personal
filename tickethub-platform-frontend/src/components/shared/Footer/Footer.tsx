import { assets } from "@/assets/assets";
import { navLinks } from "@/misc/navLinks";
import { contactData, socialLinks } from "@/misc/footerData";
import { NavLink } from "react-router";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import type { Role } from "@/misc/dashboardData";

export default function Footer() {
  const { role } = useAuthStorage();

  const visibleLinks = navLinks.filter(
    (link) => !link.roles || (role && link.roles.includes(role as Role)),
  );
  return (
    <footer className="bg-foreground w-full py-20">
      <div className="mx-auto container px-6 lg:px-12">
        <div className="flex flex-col gap-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-8 items-start">
            <div className="md:col-span-4 flex flex-col items-start gap-6">
              <NavLink to="/">
                <img
                  src={assets.TicketHubLogo}
                  alt="TicketHub Logo"
                  className="object-contain"
                  width={86}
                  height={86}
                />
              </NavLink>
              <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-sm font-sans">
                Curating the moments that matter. Your trusted platform for
                discovering and securing tickets to the most unforgettable live
                experiences.
              </p>
            </div>

            <div className="md:col-span-2 flex flex-col items-start gap-4">
              <h2 className="text-white/50 font-sans font-medium text-xs uppercase tracking-widest mb-2">
                Explore
              </h2>
              {visibleLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className="text-white hover:text-primary transition-colors text-sm md:text-base font-medium"
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            <div className="md:col-span-3 flex flex-col items-start gap-6">
              <h2 className="text-white/50 font-sans font-medium text-xs uppercase tracking-widest mb-px">
                Connect
              </h2>
              <div className="flex flex-col gap-4">
                {contactData.map((contact) => (
                  <div key={contact.name} className="flex flex-col">
                    <span className="text-white/40 text-xs mb-1 font-sans">
                      {contact.name}
                    </span>
                    <a
                      href={contact.href}
                      className="text-white hover:text-white/70 transition-colors text-sm md:text-base font-medium"
                    >
                      {contact.value}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 flex flex-col items-start gap-4 w-full">
              <h2 className="text-white/50 font-sans font-medium text-xs uppercase tracking-widest mb-2">
                Stay Updated
              </h2>
              <p className="text-white text-sm">
                Get early access to exclusive events and ticket drops.
              </p>
              {/* newsletter */}
              <form className="w-full flex items-center border-b border-white/30 pb-2 mt-2 focus-within:border-white ">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-transparent text-white placeholder:text-white/30 text-sm w-full outline-none"
                />
                <button
                  type="submit"
                  className="text-white text-sm font-medium hover:text-white/70 ml-4"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          <div className="hidden md:block w-full h-px bg-white/10" />

          {/* copyright plus icons */}
          <div className="flex flex-col-reverse md:flex-row items-center justify-between w-full gap-6">
            <p className="text-xs md:text-sm text-white/50 font-sans">
              &copy; {new Date().getFullYear()} TicketHub. All rights reserved.
            </p>

            <div className="flex items-center gap-6 md:gap-8">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="text-lg md:text-xl text-white/70 hover:text-white hover:scale-110 transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
