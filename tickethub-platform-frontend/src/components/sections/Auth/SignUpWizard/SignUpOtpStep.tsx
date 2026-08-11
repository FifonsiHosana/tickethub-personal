import { useRef, useState, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useSendOtp } from "@/hooks/useAuth";

const DIGIT_COUNT = 6;

type Props = {
  email: string;
  onNext: (otp: string) => void;
  onBack: () => void;
};

export function SignUpOtpStep({ email, onNext, onBack }: Props) {
  const { mutateAsync: sendOtp, isPending: isSending } = useSendOtp();
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

  async function handleVerify() {
    const otp = digits.join("");
    if (otp.length !== DIGIT_COUNT) {
      setError("Please enter all 6 digits");
      return;
    }
    onNext(otp);
  }

  async function handleResend() {
    try {
      await sendOtp({ email });
      toast.success("New code sent to your email.");
    } catch {
      toast.error("Failed to resend code.");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 mt-2">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Verify your email</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Enter the 6-digit code sent to
          <br />
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <Field data-invalid={!!error}>
        <FieldLabel className="sr-only">Verification code</FieldLabel>
        <div className="flex gap-2 justify-center">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
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

      <Button className="w-full rounded-full" onClick={handleVerify}>
        Verify
      </Button>

      <div className="flex items-center gap-4 text-sm">
        <button
          type="button"
          className="text-muted-foreground underline underline-offset-4 hover:text-primary font-medium"
          onClick={onBack}
        >
          Change email
        </button>
        <button
          type="button"
          className="text-muted-foreground underline underline-offset-4 hover:text-primary font-medium"
          onClick={handleResend}
          disabled={isSending}
        >
          {isSending ? "Sending..." : "Resend code"}
        </button>
      </div>
    </div>
  );
}