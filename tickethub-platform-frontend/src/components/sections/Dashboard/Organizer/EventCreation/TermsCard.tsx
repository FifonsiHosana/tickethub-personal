import { Controller, type Control } from "react-hook-form";
import { type CreateEventFormValues } from "@/types/organizer/event.schema";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

export const TermsCard = ({
  control,
}: {
  control: Control<CreateEventFormValues>;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Terms & Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        <Controller
          name="termsAndConditions"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="e.g. No refunds within 24 hours of the event..."
                className="min-h-25"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </CardContent>
    </Card>
  );
};
