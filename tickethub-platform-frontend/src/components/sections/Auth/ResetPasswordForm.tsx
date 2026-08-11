import { Link, useNavigate } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { assets } from "@/assets/assets";
import { useResetPassword } from "@/hooks/useAuth";
import {
  verifySchema,
  type VerifyFormValues,
} from "./AccountSetupPasswordForm/setupPasswordSchema";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { useState } from "react";

type Props = {
  token: string;
};

export function ResetPasswordForm({ token }: Props) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { mutateAsync: reset, isPending: isResetting } = useResetPassword();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: VerifyFormValues) => {
    try {
      await reset({ token, password: data.password });
      toast.success("Password updated. Please sign in.");
      navigate("/login", { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to reset password.";
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
          {!token ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <TriangleAlert className="size-10 text-destructive" />
              <h1 className="text-2xl font-bold">Invalid reset link</h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                This password reset link is invalid or has expired. Request a
                new one to continue.
              </p>
              <Link
                to="/forgot-password"
                className="mt-2 text-sm font-medium text-primary/80 underline underline-offset-4 hover:text-primary/70"
              >
                Request a new link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-3xl font-bold">Choose a new password</h1>
                </div>

                <Field>
                  <FieldLabel htmlFor="password">New Password</FieldLabel>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    )}
                  />
                  {errors.password && (
                    <FieldError>{errors.password.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm Password
                  </FieldLabel>
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    )}
                  />
                  {errors.confirmPassword && (
                    <FieldError>{errors.confirmPassword.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <Button
                    type="submit"
                    className="w-full mt-2 rounded-full"
                    disabled={isResetting}
                  >
                    {isResetting ? "Resetting..." : "Reset password"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
