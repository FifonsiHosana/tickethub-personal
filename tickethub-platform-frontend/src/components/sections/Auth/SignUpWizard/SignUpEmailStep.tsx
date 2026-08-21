import { useState } from "react";
import { Link } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { useSendOtp } from "@/hooks/useAuth";

const emailSchema = z.object({
  email: z.email("Enter a valid email"),
});

type EmailFormValues = z.infer<typeof emailSchema>;

type Props = {
  onNext: (email: string) => void;
};

export function SignUpEmailStep({ onNext }: Props) {
  const [accountExists, setAccountExists] = useState(false);
  const { mutateAsync: sendOtp, isPending } = useSendOtp();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: EmailFormValues) => {
    try {
      const response = await sendOtp({ email: data.email });

      if (response.data?.active) {
        setAccountExists(true);
        return;
      }

      toast.success("Verification code sent to your email.");
      onNext(data.email);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send code.";
      toast.error(message);
    }
  };

  if (accountExists) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 mt-2 text-center">
        <h1 className="text-3xl font-bold">You already have an account</h1>
        <p className="text-balance text-muted-foreground text-sm">
          An account with this email already exists. Log in and you can create
          an event or keep browsing tickets.
        </p>
        <Link to="/login" className="w-full">
          <Button type="button" className="w-full">
            Log in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-2 mt-2">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-bold">Create your account</h1>
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
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </Field>

          <Field>
            <Button
              type="submit"
              className="w-full mt-2 rounded-full"
              disabled={isPending}
            >
              {isPending ? "Sending code..." : "Get verification code"}
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?
        <Link
          to="/login"
          className="underline underline-offset-4 hover:text-primary font-medium"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}