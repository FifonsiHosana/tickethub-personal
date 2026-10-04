import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRequestPasswordReset } from "@/hooks/useAuth";
import { contactChannel, normalizeGhanaPhoneForDisplay } from "@/utils/authIdentity";

const schema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or phone number."),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  onEmailSent: () => void;
  onPhoneSent: (identifier: string) => void;
};

export function ForgotPasswordRequestStep({ onEmailSent, onPhoneSent }: Props) {
  const { mutateAsync: requestReset, isPending } = useRequestPasswordReset();
  const { handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: FormValues) => {
    const identifier = data.identifier.trim();
    const channel = contactChannel(identifier);

    try {
      await requestReset({ identifier });
      if (channel === "email") {
        onEmailSent();
        return;
      }
      onPhoneSent(normalizeGhanaPhoneForDisplay(identifier));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send reset instructions.";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold">Forgot your password?</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email or phone number and we will send reset instructions.
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="identifier">Email/Phone</FieldLabel>
          <Controller
            name="identifier"
            control={control}
            render={({ field }) => (
              <Input
                id="identifier"
                type="text"
                placeholder="m@example.com or 055..."
                autoComplete="username"
                {...field}
              />
            )}
          />
          {errors.identifier && <FieldError>{errors.identifier.message}</FieldError>}
        </Field>

        <Field>
          <Button type="submit" className="mt-2 w-full rounded-full" disabled={isPending}>
            {isPending ? "Sending..." : "Send reset instructions"}
          </Button>
        </Field>

        <FieldDescription className="mt-4 text-center text-sm">
          Remembered it? <Link to="/login" className="font-medium text-primary/80 underline underline-offset-4 hover:text-primary/70">Back to login</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
