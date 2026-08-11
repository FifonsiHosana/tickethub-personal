import { useRef, useState, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { useSendOtp } from "@/hooks/useAuth";
import { OtpInput } from "./OtpInput";

const DIGIT_COUNT = 6;

type Props = {
  email: string;
  onNext: (otp: string) => void;
  onBack: () => void;
};

export function SetupOtpStep({ email, onNext, onBack }: Props) {
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

  function handleVerify() {
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
      setDigits(Array(DIGIT_COUNT).fill(""));
      inputRefs.current[0]?.focus();
    } catch {
      toast.error("Failed to resend code.");
    }
  }

  return (
    <Field data-invalid={!!error}>
      <p className="text-sm text-muted-foreground text-center mb-2">
        Code sent to{" "}
        <span className="font-medium text-foreground">{email}</span>
      </p>

      <OtpInput
        digits={digits}
        inputRefs={inputRefs}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {error && <FieldError>{error}</FieldError>}

      <Button
        type="button"
        className="w-full mt-4 rounded-full"
        onClick={handleVerify}
        disabled={isSending}
      >
        Continue
      </Button>

      <div className="flex items-center justify-between text-sm mt-4">
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
    </Field>
  );
}