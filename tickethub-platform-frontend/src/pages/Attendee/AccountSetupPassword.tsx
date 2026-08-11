import { Link, useSearchParams } from "react-router";
import { assets } from "@/assets/assets";
import { AccountSetupPasswordForm } from "@/components/sections/Auth/AccountSetupPasswordForm";
import {
  getSessionItem,
  GUEST_CHECKOUT_EMAIL_KEY,
} from "@/utils/storage/sessionStorage";

export default function AccountSetupPasswordPage() {
  const [searchParams] = useSearchParams();
  const queryEmail = searchParams.get("email") ?? "";
  const initialEmail =
    queryEmail || getSessionItem(GUEST_CHECKOUT_EMAIL_KEY) || "";

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="relative hidden bg-muted lg:block">
        <img
          src={assets.Hero4}
          alt="Concert Crowd"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <div className="flex flex-col items-center justify-center p-8 sm:p-12">
        <Link to="/" className="hover:cursor-pointer">
          <img
            src={assets.TicketHubLogo}
            width={72}
            height={72}
            alt="TicketHub Logo"
          />
        </Link>
        <AccountSetupPasswordForm initialEmail={initialEmail} />
      </div>
    </div>
  );
}
