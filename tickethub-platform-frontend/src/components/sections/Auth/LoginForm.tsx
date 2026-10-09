import { useState, type KeyboardEvent } from "react";
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
import {
  useRequestPhoneLoginOtp,
  useSignInWithEmailAndPassword,
  useVerifyPhoneLoginOtp,
} from "@/hooks/useAuth";
import { Loader } from "@/components/ui/loader";
import { Link, useNavigate } from "react-router";
import { Checkbox } from "@/components/ui/checkbox";
import { decodeToken } from "@/utils/token";
import type { Role } from "@/misc/dashboardData";
import { isEmailIdentifier } from "@/utils/authIdentity";

const DIGIT_COUNT = 6;

const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Email or phone is required"),
  password: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function routeAfterLogin(token: string, navigate: ReturnType<typeof useNavigate>) {
  const { roles } = decodeToken(token);
  const isDashboardUser = (roles as Role[]).some((role) =>
    DASHBOARD_ROLES.includes(role),
  );
  navigate(isDashboardUser ? "/dashboard" : "/ticket-order-history");
}

export function LoginForm() {
  const { setAuth } = useAuthStorage();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [phoneOtpTarget, setPhoneOtpTarget] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(DIGIT_COUNT).fill(""));
  const [otpError, setOtpError] = useState("");

  const { mutateAsync: signInWithEmailAndPassword, isPending: isSigningIn } =
    useSignInWithEmailAndPassword();
  const { mutateAsync: requestPhoneOtp, isPending: isRequestingOtp } =
    useRequestPhoneLoginOtp();
  const { mutateAsync: verifyPhoneOtp, isPending: isVerifyingOtp } =
    useVerifyPhoneLoginOtp();

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
    mode: "onChange",
  });

  const identifier = watch("identifier");
  const isEmail = isEmailIdentifier(identifier || "");
  const isPending = isSigningIn || isRequestingOtp || isVerifyingOtp;

  if (isSigningIn) return <Loader loading={isSigningIn} fullScreen={true} />;

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const value = data.identifier.trim();
      if (isEmailIdentifier(value)) {
        if (!data.password) {
          toast.error("Password cannot be empty");
          return;
        }
        const result = await signInWithEmailAndPassword({
          email: value,
          password: data.password,
        });
        setAuth({ token: result.data.token, user: result.data.user, rememberMe });
        toast.success("Signed in successfully");
        routeAfterLogin(result.data.token, navigate);
        return;
      }

      await requestPhoneOtp({ identifier: value });
      setPhoneOtpTarget(value);
      setDigits(Array(DIGIT_COUNT).fill(""));
      toast.success("Login code sent.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Log in failed";
      toast.error(message);
    }
  };

  function handleOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setOtpError("");
  }

  function handleOtpKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    const target = e.currentTarget;
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      (target.previousElementSibling as HTMLInputElement | null)?.focus();
    }
  }

  async function handleVerifyPhoneOtp() {
    const otp = digits.join("");
    if (otp.length !== DIGIT_COUNT) {
      setOtpError("Please enter all 6 digits");
      return;
    }
    try {
      const result = await verifyPhoneOtp({ identifier: phoneOtpTarget, otp });
      setAuth({ token: result.data.token, user: result.data.user, rememberMe });
      toast.success("Signed in successfully");
      routeAfterLogin(result.data.token, navigate);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid code";
      toast.error(message);
    }
  }

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
          <img src={assets.TicketHubLogo} width={72} height={72} alt="TicketHub Logo" />
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-col gap-6 mt-2">
          {phoneOtpTarget ? (
            <div className="space-y-5 text-center">
              <h1 className="text-3xl font-bold">Enter login code</h1>
              <p className="text-sm text-muted-foreground">Code sent to {phoneOtpTarget}</p>
              <Field data-invalid={!!otpError}>
                <FieldLabel className="sr-only">Login code</FieldLabel>
                <div className="flex justify-center gap-2">
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="h-12 w-11 rounded-md border border-border text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ))}
                </div>
                {otpError && <FieldError>{otpError}</FieldError>}
              </Field>
              <Button className="w-full rounded-full" onClick={handleVerifyPhoneOtp} disabled={isPending}>
                {isVerifyingOtp ? "Verifying..." : "Verify and login"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setPhoneOtpTarget("")}>Change email/phone</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-3xl font-bold">Welcome back</h1>
                </div>

                <Field>
                  <FieldLabel htmlFor="identifier">Email/Phone</FieldLabel>
                  <Controller
                    name="identifier"
                    control={control}
                    render={({ field }) => (
                      <Input id="identifier" type="text" placeholder="m@example.com or 055XXXXXXX" autoComplete="username" {...field} />
                    )}
                  />
                  {errors.identifier && <FieldError>{errors.identifier.message}</FieldError>}
                </Field>

                {isEmail && (
                  <Field>
                    <div className="flex items-center"><FieldLabel htmlFor="password">Password</FieldLabel></div>
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" {...field} />
                          <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      )}
                    />
                    {errors.password && <FieldError>{errors.password.message}</FieldError>}
                  </Field>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Checkbox id="rememberMe" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(!!checked)} />
                    <label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Remember me</label>
                  </div>
                  <Link to="/forgot-password" className="ml-auto text-sm text-primary/90 underline hover:text-primary/40">Forgot your password?</Link>
                </div>

                <Field>
                  <Button type="submit" className="w-full mt-2 rounded-full" disabled={isPending}>
                    {isRequestingOtp ? "Sending code..." : isEmail ? "Login" : "Send SMS code"}
                  </Button>
                </Field>

                <FieldDescription className="mt-4 text-center text-sm">
                  Don&apos;t have an account? <Link to="/signup" className="underline underline-offset-4 text-primary/80 hover:text-primary/70 font-medium">Sign up</Link>
                </FieldDescription>
              </FieldGroup>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
