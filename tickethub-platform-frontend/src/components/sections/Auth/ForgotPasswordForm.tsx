import { useState } from "react";
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
import { assets } from "@/assets/assets";
import { useRequestPasswordReset } from "@/hooks/useAuth";

const forgotPasswordSchema = z.object({
  email: z.email().nonempty({ message: "Enter a valid email." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const { mutateAsync: requestReset, isPending: isRequesting } =
    useRequestPasswordReset();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await requestReset(data);
      setSubmitted(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send reset link.";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="relative hidden bg-muted lg:block">
        <img
          src={assets.Hero4}
          alt="Concert Crowd"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>

      <div className="flex flex-col items-center justify-center p-8 sm:p-12 h-screen lg:h-full">
        <Link className="hover:cursor-pointer" to="/">
          <img
            src={assets.TicketHubLogo}
            width={72}
            height={72}
            alt="TicketHub Logo"
          />
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-col gap-6 mt-2">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <h1 className="text-2xl font-bold">Check your email</h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                If an account exists for that email, a password reset link has
                been sent. The link expires in 60 minutes.
              </p>
              <Link
                to="/login"
                className="mt-2 text-sm font-medium text-primary/80 underline underline-offset-4 hover:text-primary/70"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-3xl font-bold">Forgot your password?</h1>
                  <p className="text-sm text-muted-foreground">
                    Enter your email and we will send you a link to reset your
                    password.
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        autoComplete="email"
                        {...field}
                      />
                    )}
                  />
                  {errors.email && (
                    <FieldError>{errors.email.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <Button
                    type="submit"
                    className="w-full mt-2 rounded-full"
                    disabled={isRequesting}
                  >
                    {isRequesting ? "Sending..." : "Send reset link"}
                  </Button>
                </Field>

                <FieldDescription className="mt-4 text-center text-sm">
                  Remembered it?{" "}
                  <Link
                    to="/login"
                    className="underline underline-offset-4 text-primary/80 hover:text-primary/70 font-medium"
                  >
                    Back to login
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}