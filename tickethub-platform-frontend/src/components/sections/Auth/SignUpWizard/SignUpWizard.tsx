import { useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { assets } from "@/assets/assets";
import { SignUpEmailStep } from "./SignUpEmailStep";
import { SignUpOtpStep } from "./SignUpOtpStep";
import { SignUpProfileStep } from "./SignUpProfileStep";
import useSessionStorage from "@/hooks/useSessionStorage";

export function SignUpWizard() {
  const [step, setStep] = useSessionStorage<number>("signup_step", 0);
  // const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  function renderStep() {
    switch (step) {
      case 0:
        return (
          <SignUpEmailStep
            onNext={(value) => {
              setEmail(value);
              setStep(1);
            }}
          />
        );
      case 1:
        return (
          <SignUpOtpStep
            email={email}
            onNext={(code) => {
              setOtp(code);
              setStep(2);
            }}
            onBack={() => setStep(0)}
          />
        );
      case 2:
        return (
          <SignUpProfileStep
            email={email}
            otp={otp}
            onBack={() => setStep(1)}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="relative hidden bg-muted lg:block">
        <img
          src="https://cdn.ayatickets.com/uploads/homepage/marquee/69983efc8a022835738658.webp"
          alt="Concert Crowd"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>

      <div className="flex flex-col items-center justify-center h-screen lg:h-full p-8 sm:p-12">
        <Link to="/" className="hover:cursor-pointer">
          <img
            src={assets.TicketHubLogo}
            width={72}
            height={72}
            alt="TicketHub Logo"
          />
        </Link>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
