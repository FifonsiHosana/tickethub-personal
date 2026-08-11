import { Controller, useForm } from "react-hook-form";
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
import {
  removeSessionItem,
  GUEST_CHECKOUT_EMAIL_KEY,
} from "@/utils/storage/sessionStorage";
import { verifySchema, type VerifyFormValues } from "./setupPasswordSchema";

type Props = {
  email: string;
  otp: string;
};

export function SetupPasswordStep({ email, otp }: Props) {
  const navigate = useNavigate();
  const { setAuth } = useAuthStorage();
  const { mutateAsync: complete, isPending: isCompleting } =
    useCompleteRegister();

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
      const response = await complete({ email, otp, password: data.password });

      setAuth({
        token: response.data.token,
        user: response.data.user,
        activeRole: "attendee",
      });

      removeSessionItem(GUEST_CHECKOUT_EMAIL_KEY);
      toast.success("Account set up! Here are your tickets.");
      navigate("/ticket-order-history");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to set up your account.";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
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
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...field}
              />
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
            disabled={isCompleting}
          >
            {isCompleting ? "Setting up..." : "Set password & view my tickets"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}