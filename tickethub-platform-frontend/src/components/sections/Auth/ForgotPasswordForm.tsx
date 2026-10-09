import { useState } from "react";
import { ForgotPasswordPhoneResetStep } from "./ForgotPasswordPhoneResetStep";
import { ForgotPasswordRequestStep } from "./ForgotPasswordRequestStep";
import { ForgotPasswordResult } from "./ForgotPasswordResult";
import { ForgotPasswordShell } from "./ForgotPasswordShell";

type Step = "request" | "email-sent" | "phone-code" | "done";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("request");
  const [phoneIdentifier, setPhoneIdentifier] = useState("");

  return (
    <ForgotPasswordShell>
      {step === "request" && (
        <ForgotPasswordRequestStep
          onEmailSent={() => setStep("email-sent")}
          onPhoneSent={(identifier) => {
            setPhoneIdentifier(identifier);
            setStep("phone-code");
          }}
        />
      )}

      {step === "email-sent" && (
        <ForgotPasswordResult
          title="Check your email"
          message="If an account exists for that email, a password reset link has been sent. The link expires in 60 minutes."
        />
      )}

      {step === "phone-code" && (
        <ForgotPasswordPhoneResetStep
          identifier={phoneIdentifier}
          onComplete={() => setStep("done")}
        />
      )}

      {step === "done" && (
        <ForgotPasswordResult
          title="Password updated"
          message="Your password has been updated successfully. Please sign in with your new password."
        />
      )}
    </ForgotPasswordShell>
  );
}
