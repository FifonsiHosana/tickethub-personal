import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { assets } from "@/assets/assets";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { useAuthStorage, DASHBOARD_ROLES } from "@/hooks/useAuthStorage";
import { useSignInWithEmailAndPassword } from "@/hooks/useAuth";
import { Loader } from "@/components/ui/loader";
import { Link, useNavigate } from "react-router";
import { Checkbox } from "@/components/ui/checkbox";
import { decodeToken } from "@/utils/token";
import type { Role } from "@/misc/dashboardData";

const loginSchema = z.object({
  email: z.email().nonempty(),
  password: z.string().nonempty({ error: "Field Cannot be empty" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { setAuth } = useAuthStorage();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { mutateAsync: signInWithEmailAndPassword, isPending: isSigningIn } =
    useSignInWithEmailAndPassword();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  if (isSigningIn) return <Loader loading={isSigningIn} fullScreen={true} />;

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await signInWithEmailAndPassword(data);
      setAuth({
        token: result.data.token,
        user: result.data.user,
        rememberMe: rememberMe,
      });
      toast.success("Signed in successfully");

      const { roles } = decodeToken(result.data.token);
      const isDashboardUser = (roles as Role[]).some((role) =>
        DASHBOARD_ROLES.includes(role),
      );
      navigate(isDashboardUser ? "/dashboard" : "/ticket-order-history");
    } catch (error) {
      console.log(error);
      const message = error instanceof Error ? error.message : "Log in failed";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Left side */}
      <div className="relative hidden bg-muted lg:block">
        <img
          src={assets.Hero4}
          alt="Concert Crowd"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>

      {/* Right side */}
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-3xl font-bold">Welcome back</h1>
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
                      {...field}
                    />
                  )}
                />
                {errors.email && (
                  <FieldError>{errors.email.message}</FieldError>
                )}
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(!!checked)}
                    />
                    <label
                      htmlFor="rememberMe"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="ml-auto text-sm text-primary/90 underline hover:text-primary/40"
                  >
                    Forgot your password?
                  </Link>
                </div>
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
              </Field>

              <Field>
                <Button type="submit" className="w-full mt-2 rounded-full">
                  Login
                </Button>
              </Field>

              <FieldDescription className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="underline underline-offset-4 text-primary/80 hover:text-primary/70 font-medium"
                >
                  Sign up
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  );
}
