import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const checkoutSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "" },
  });

  return (
    <form
      id="checkout-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* First Name */}
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                First Name
              </label>
              <input
                {...field}
                placeholder="Kwame"
                className="w-full px-4 py-3 border-b-2 border-neutral-200 bg-neutral-50/50 focus:border-primary focus:outline-none transition-all"
              />
              {errors.firstName && (
                <span className="text-xs text-red-500">
                  {errors.firstName.message}
                </span>
              )}
            </div>
          )}
        />

        {/* Last Name */}
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Last Name
              </label>
              <input
                {...field}
                placeholder="Mensah"
                className="w-full px-4 py-3 border-b-2 border-neutral-200 bg-neutral-50/50 focus:border-primary focus:outline-none  transition-all"
              />
              {errors.lastName && (
                <span className="text-xs text-red-500">
                  {errors.lastName.message}
                </span>
              )}
            </div>
          )}
        />
      </div>

      {/* Email */}
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Email Address
            </label>
            <input
              {...field}
              type="email"
              placeholder="kwame.mensah@example.com"
              className="w-full px-4 py-3 border-b-2 border-neutral-200 bg-neutral-50/50 focus:border-primary focus:outline-none  transition-all"
            />
            {errors.email && (
              <span className="text-xs text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>
        )}
      />

      {/* Phone */}
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Phone Number
            </label>
            <input
              {...field}
              type="tel"
              placeholder=" 055 000 0000"
              className="w-full px-4 py-3 border-b-2 border-neutral-200 bg-neutral-50/50 focus:border-primary focus:outline-none transition-all"
            />
            {errors.phone && (
              <span className="text-xs text-red-500">
                {errors.phone.message}
              </span>
            )}
          </div>
        )}
      />
    </form>
  );
};
