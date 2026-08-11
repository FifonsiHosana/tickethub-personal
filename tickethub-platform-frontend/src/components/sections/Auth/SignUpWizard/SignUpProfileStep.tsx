import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { useCompleteRegister } from "@/hooks/useAuth";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { FaEyeSlash, FaEye } from "react-icons/fa6";
import { useState } from "react";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(64)
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

const profileSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters"),
    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;

type Props = {
  email: string;
  otp: string;
  onBack: () => void;
};

export function SignUpProfileStep({ email, otp, onBack }: Props) {
  const navigate = useNavigate();
  const { setAuth } = useAuthStorage();
  const { mutateAsync: complete, isPending } = useCompleteRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const response = await complete({
        email,
        otp,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        roleName: "organizer",
      });

      setAuth({
        token: response.data.token,
        user: response.data.user,
        activeRole: "organizer",
      });

      toast.success("Account created! Welcome to TicketHub.");
      navigate("/organizer/events/new");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Account creation failed.";
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-2 mt-2">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center mb-2">
            <h1 className="text-3xl font-bold">Almost there</h1>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field>
              <FieldLabel htmlFor="firstName">First Name</FieldLabel>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    id="firstName"
                    placeholder="John"
                    {...field}
                  />
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
                  <Input
                    type="text"
                    id="lastName"
                    placeholder="Doe"
                    {...field}
                  />
                )}
              />
              {errors.lastName && (
                <FieldError>{errors.lastName.message}</FieldError>
              )}
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
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
            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              )}
            />
            {errors.confirmPassword && (
              <FieldError>{errors.confirmPassword.message}</FieldError>
            )}
          </Field>

          <Field>
            <Button type="submit" className="w-full mt-2 rounded-full" disabled={isPending}>
              {isPending ? "Creating account..." : "Create account"}
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="text-center text-sm text-muted-foreground underline underline-offset-4 hover:text-primary font-medium"
      >
        Back
      </button>
    </div>
  );
}
