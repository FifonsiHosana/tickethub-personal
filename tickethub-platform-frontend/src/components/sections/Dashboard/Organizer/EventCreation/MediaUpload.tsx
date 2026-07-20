import { Controller, type Control } from "react-hook-form";
import { ImageIcon } from "lucide-react";
import { type CreateEventFormValues } from "@/types/organizer/event.schema";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface MediaUploadProps {
  control: Control<CreateEventFormValues>;
  imagePreview: string | null;
  setImagePreview: (url: string | null) => void;
}

export const MediaUploadCard = ({
  control,
  imagePreview,
  setImagePreview,
}: MediaUploadProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Media</CardTitle>
        <CardDescription>
          Upload a stunning banner to attract attendees.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Controller
          name="bannerImage"
          control={control}
          render={({ field, fieldState }) => {
            const { onChange, onBlur, name } = field;

            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={name}>Banner Image</FieldLabel>
                <FieldContent>
                  <div className="flex flex-col items-center justify-center gap-4">
                    {imagePreview ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:bg-muted transition-colors">
                        <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Select an image
                        </span>
                      </div>
                    )}
                    <Input
                      type="file"
                      id={name}
                      name={name}
                      accept="image/png, image/jpeg, image/webp"
                      aria-invalid={fieldState.invalid}
                      className="cursor-pointer"
                      onBlur={onBlur}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
                          setImagePreview(URL.createObjectURL(file));
                        } else {
                          onChange(undefined);
                          setImagePreview(null);
                        }
                      }}
                    />
                  </div>
                  <FieldDescription>
                    Max size: 5MB. Formats: JPG, PNG, WEBP.
                  </FieldDescription>
                </FieldContent>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            );
          }}
        />
      </CardContent>
    </Card>
  );
};
