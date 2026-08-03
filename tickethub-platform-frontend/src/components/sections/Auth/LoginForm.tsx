import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldError,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FaApple, FaGoogle, FaMeta } from "react-icons/fa6";
import { assets } from "@/assets/assets";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { useSignInWithEmailAndPassword } from "@/hooks/useAuth";
import { Loader } from "@/components/ui/loader";
import { Link } from "react-router";

const loginSchema = z.object({
  email: z.email().nonempty(),
  password: z.string().nonempty({ error: "Field Cannot be empty"}),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { setAuth } = useAuthStorage();

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
  });

  if (isSigningIn) return <Loader loading={isSigningIn} fullScreen={true} />;

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await signInWithEmailAndPassword(data);
      setAuth({ token: result.data.token, user: result.data.user });
      toast.success("Signed in successfully");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Left side */}
      <div className="flex flex-col items-center justify-center p-8 sm:p-12">
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
              <div className="flex flex-col items-center gap-2 text-center mb-2">
                <h1 className="text-3xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground text-sm">
                  Login to your TicketHub account
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
                  <a
                    // TODO: Implement forgot password functionality
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input id="password" type="password" {...field} />
                  )}
                />
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
              </Field>

              <Field>
                <Button type="submit" className="w-full mt-2">
                  Login
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-background text-xs text-muted-foreground">
                Or continue with
              </FieldSeparator>

              <Field className="grid grid-cols-3 gap-4">
                <Button variant="outline" type="button" className="w-full">
                  <FaApple className="h-5 w-5" />
                  <span className="sr-only">Login with Apple</span>
                </Button>
                <Button variant="outline" type="button" className="w-full">
                  <FaGoogle className="h-4 w-4" />
                  <span className="sr-only">Login with Google</span>
                </Button>
                <Button variant="outline" type="button" className="w-full">
                  <FaMeta className="h-5 w-5" />
                  <span className="sr-only">Login with Meta</span>
                </Button>
              </Field>

              <FieldDescription className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="underline underline-offset-4 hover:text-primary font-medium"
                >
                  Sign up
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          <FieldDescription className="text-center text-sm text-muted-foreground text-balance">
            By clicking continue, you agree to our{" "}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </a>
            .
          </FieldDescription>
        </div>
      </div>

      {/* Right side */}
      <div className="relative hidden bg-muted lg:block">
        <img
          src="https://cdn.ayatickets.com/uploads/homepage/marquee/69983efc8a022835738658.webp"
          alt="Concert Crowd"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
