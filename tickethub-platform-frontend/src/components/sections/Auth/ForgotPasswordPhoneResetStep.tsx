import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRequestPasswordReset, useResetPassword } from "@/hooks/useAuth";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(64)
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

const schema = z
  .object({
    otp: z.string().length(6, "Enter the 6-digit code.").regex(/^\d+$/),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

type Props = {
  identifier: string;
  onComplete: () => void;
};

export function ForgotPasswordPhoneResetStep({ identifier, onComplete }: Props) {
  const { mutateAsync: resetPassword, isPending: isResetting } = useResetPassword();
  const { mutateAsync: resendCode, isPending: isResending } = useRequestPasswordReset();
  const { handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { otp: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await resetPassword({ identifier, otp: data.otp, password: data.password });
      toast.success("Password updated. Please sign in.");
      onComplete();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reset password.";
      toast.error(message);
    }
  };

  const handleResend = async () => {
    try {
      await resendCode({ identifier });
      toast.success("A new code has been sent.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to resend code.";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold">Verify your phone</h1>
          <p className="text-sm text-muted-foreground">
            Enter the SMS code sent to {identifier}, then choose a new password.
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="otp">SMS code</FieldLabel>
          <Controller name="otp" control={control} render={({ field }) => <Input id="otp" inputMode="numeric" maxLength={6} {...field} />} />
          {errors.otp && <FieldError>{errors.otp.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <Controller name="password" control={control} render={({ field }) => <Input id="password" type="password" autoComplete="new-password" {...field} />} />
          {errors.password && <FieldError>{errors.password.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <Controller name="confirmPassword" control={control} render={({ field }) => <Input id="confirmPassword" type="password" autoComplete="new-password" {...field} />} />
          {errors.confirmPassword && <FieldError>{errors.confirmPassword.message}</FieldError>}
        </Field>

        <Button type="submit" className="mt-2 w-full rounded-full" disabled={isResetting}>
          {isResetting ? "Resetting..." : "Reset password"}
        </Button>
        <Button type="button" variant="ghost" className="w-full" disabled={isResending} onClick={handleResend}>
          {isResending ? "Sending..." : "Resend code"}
        </Button>
      </FieldGroup>
    </form>
  );
}
