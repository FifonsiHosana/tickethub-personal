import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SetupEmailStep } from "./SetupEmailStep";
import { SetupOtpStep } from "./SetupOtpStep";
import { SetupPasswordStep } from "./SetupPasswordStep";

type Props = {
  initialEmail: string;
};

export function AccountSetupPasswordForm({ initialEmail }: Props) {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");

  function renderStep() {
    switch (step) {
      case 0:
        return (
          <SetupEmailStep
            initialEmail={initialEmail}
            onNext={(value) => {
              setEmail(value);
              setStep(1);
            }}
          />
        );
      case 1:
        return (
          <SetupOtpStep
            email={email}
            onNext={(code) => {
              setOtp(code);
              setStep(2);
            }}
            onBack={() => setStep(0)}
          />
        );
      case 2:
        return <SetupPasswordStep email={email} otp={otp} />;
      default:
        return null;
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-2 mt-2">
      <div className="flex flex-col items-center gap-2 text-center mb-2">
        <h1 className="text-3xl font-bold">Set up your account</h1>
        <p className="text-balance text-muted-foreground text-sm">
          A TicketHub account was created for you with your purchase. Set a
          password to view your ticket order history.
        </p>
      </div>

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
  );
}