import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { useSendOtp } from "@/hooks/useAuth";

type Props = {
  initialEmail: string;
  onNext: (email: string) => void;
};

export function SetupEmailStep({ initialEmail, onNext }: Props) {
  const navigate = useNavigate();
  const { mutateAsync: sendOtp, isPending: isSending } = useSendOtp();
  const [email, setEmail] = useState(initialEmail);

  async function handleSendCode() {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Enter a valid email.");
      return;
    }
    try {
      const response = await sendOtp({ email });

      if (response.data?.active) {
        toast.error("This account already has a password. Log in instead.");
        navigate("/login");
        return;
      }

      toast.success("Verification code sent to your email.");
      onNext(email);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send code.";
      toast.error(message);
    }
  }

  return (
    <Field>
      <FieldLabel htmlFor="setupEmail">Email</FieldLabel>
      <Input
        id="setupEmail"
        type="email"
        placeholder="m@example.com"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button
        type="button"
        className="w-full mt-2 rounded-full"
        onClick={handleSendCode}
        disabled={isSending}
      >
        {isSending ? "Sending code..." : "Send verification code"}
      </Button>
    </Field>
  );
}
