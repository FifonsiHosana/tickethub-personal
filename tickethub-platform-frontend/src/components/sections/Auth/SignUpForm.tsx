import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { assets } from "@/assets/assets";
import { useSignUpWithEmailAndPassword, useRoles } from "@/hooks/useAuth";
import { logger } from "@/utils/logger";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(64)
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters"),
    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters"),
    email: z.email("Invalid email"),
    phoneNumber: z
      .string()
      .regex(/^\d+$/, { message: "Must contain only numbers" })
      .min(10, "Phone number must not be less than 10 digits"),
    password: passwordSchema,
    role: z.string("Please select an account type."),
  })
  .refine((data) => data.role.length > 0, {
    message: "Please select an account type.",
    path: ["role"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignUpForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("token");
  const { mutateAsync: signUp, isPending } = useSignUpWithEmailAndPassword();
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = Array.isArray(rolesData?.data) ? rolesData.data : [];
  const selectableRoles = roles.filter((role) =>
    ["organizer", "attendee"].includes(role.name),
  );

  logger.info(`These are the roles ${JSON.stringify(roles)}`);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      role: inviteToken ? "event_staff" : "",
    },
    mode: "onChange",
  });

  if (isSubmitting) return <Loader loading={isSubmitting} fullScreen />;

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setIsSubmitting(true);
      const roleName = inviteToken ? "event_staff" : data.role;
      const selectedRole = roles.find(
        (r: { name: string }) => r.name === roleName,
      );
      const roleId = selectedRole?.id;

      if (!roleId) {
        throw new Error("Please select a valid account type.");
      }

      const response = await signUp({
        ...data,
        roleId,
        inviteToken: inviteToken || undefined,
      });

      if (response?.data?.alreadyPending) {
        toast.success(
          "An account is already pending verification. A new code has been sent to your email.",
        );
      } else {
        toast.success(
          "Account created! Check your email for the verification code.",
        );
      }
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Sign Up failed.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-8 sm:p-12">
        <Link to="/" className="hover:cursor-pointer">
          <img
            src={assets.TicketHubLogo}
            width={72}
            height={72}
            alt="TicketHub Logo"
          />
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-col gap-2 mt-2">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center mb-2">
                <h1 className="text-3xl font-bold">Create your account</h1>
                <p className="text-balance text-muted-foreground text-sm">
                  {inviteToken && "You've been invited as event staff"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Field>
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <Input id="firstName" placeholder="John" {...field} />
                    )}
                  />
                  {errors.firstName && (
                    <FieldError>{errors.firstName.message}</FieldError>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <Input id="lastName" placeholder="Doe" {...field} />
                    )}
                  />
                  {errors.lastName && (
                    <FieldError>{errors.lastName.message}</FieldError>
                  )}
                </Field>
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

              {!inviteToken && (
                <Field>
                  <FieldLabel htmlFor="role">Role</FieldLabel>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                        disabled={isLoadingRoles}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {field.value && !isLoadingRoles
                              ? field.value.charAt(0).toUpperCase() +
                                field.value.slice(1)
                              : "Select Account Type"}
                          </SelectValue>
                        </SelectTrigger>

                        <SelectContent>
                          {selectableRoles.map((role) => (
                            <SelectItem key={role.id} value={role.name}>
                              {role.name.charAt(0).toUpperCase() +
                                role.name.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.role && (
                    <FieldError>{errors.role.message}</FieldError>
                  )}
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="phoneNumber">Phone</FieldLabel>
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="phoneNumber"
                      type="tel"
                      inputMode="numeric"
                      placeholder="020XXXXXXX"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.replace(/\D/g, ""))
                      }
                    />
                  )}
                />
                {errors.phoneNumber && (
                  <FieldError>{errors.phoneNumber.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...field}
                    />
                  )}
                />
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full mt-2 rounded-full"
                  disabled={isPending}
                >
                  {isPending ? "Creating account..." : "Sign Up"}
                </Button>
              </Field>
            </FieldGroup>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="underline underline-offset-4 hover:text-primary font-medium"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
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
