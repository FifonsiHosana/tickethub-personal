import { useState, useRef, type KeyboardEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { assets } from "@/assets/assets";
import { useVerifyOtp, useResendOtp } from "@/hooks/useAuth";

const DIGIT_COUNT = 6;

export function VerifyOtpForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const { mutateAsync: verify, isPending: isVerifying } = useVerifyOtp();
  const { mutateAsync: resend, isPending: isResending } = useResendOtp();
  const [digits, setDigits] = useState<string[]>(Array(DIGIT_COUNT).fill(""));
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError("");

    if (value && index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleSubmit() {
    const otp = digits.join("");
    if (otp.length !== DIGIT_COUNT) {
      setError("Please enter all 6 digits");
      return;
    }
    try {
      await verify({ email, otp });
      toast.success("Email verified! You can now log in.");
      navigate("/login");
    } catch {
      setError("Invalid or expired code. Try again.");
    }
  }

  async function handleResend() {
    try {
      await resend({ email });
      toast.success("New code sent to your email.");
    } catch {
      toast.error("Failed to resend code.");
    }
  }

  return (
    <div className="min-h-screen w-full  lg:grid lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-8 sm:p-12">
        <img src={assets.TicketHubLogo} width={72} height={72} alt="TicketHub Logo" />
        <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 mt-2">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Verify your email</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Enter the 6-digit code sent to<br />
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <Field data-invalid={!!error}>
            <FieldLabel className="sr-only">Verification code</FieldLabel>
            <div className="flex gap-2 justify-center">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-12 text-center text-lg font-semibold rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus={i === 0}
                />
              ))}
            </div>
            {error && <FieldError>{error}</FieldError>}
          </Field>

          <Button className="w-full" onClick={handleSubmit} disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>

          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the code?{" "}
            <button type="button" className="underline underline-offset-4 hover:text-primary font-medium" onClick={handleResend} disabled={isResending}>
              {isResending ? "Sending..." : "Resend"}
            </button>
          </p>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="https://cdn.ayatickets.com/uploads/homepage/marquee/69983efc8a022835738658.webp"
          alt="Concert Crowd"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
