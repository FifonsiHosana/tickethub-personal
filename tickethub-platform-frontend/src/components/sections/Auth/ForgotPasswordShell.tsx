import type { ReactNode } from "react";
import { Link } from "react-router";
import { assets } from "@/assets/assets";

export function ForgotPasswordShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="relative hidden bg-muted lg:block">
        <img
          src={assets.Hero4}
          alt="Concert Crowd"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>

      <div className="flex h-screen flex-col items-center justify-center p-8 sm:p-12 lg:h-full">
        <Link className="hover:cursor-pointer" to="/">
          <img
            src={assets.TicketHubLogo}
            width={72}
            height={72}
            alt="TicketHub Logo"
          />
        </Link>
        <div className="mx-auto mt-2 flex w-full max-w-sm flex-col gap-6">
          {children}
        </div>
      </div>
    </div>
  );
}
