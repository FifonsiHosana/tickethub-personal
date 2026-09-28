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
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
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
          Upload a stunning Flyer to attract attendees.
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
                <FieldLabel htmlFor={name}>
                  Flyer Image <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <div className="flex flex-col items-center justify-center gap-4">
                    <label
                      htmlFor={name}
                      className="group relative block w-full cursor-pointer"
                    >
                      {imagePreview ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          {/* Hover overlay so users know it's clickable */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                            Click to change image
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 group-hover:bg-muted transition-colors peer-focus-visible:border-primary">
                          <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">
                            Select an image
                          </span>
                        </div>
                      )}
                    </label>

                    <Input
                      type="file"
                      id={name}
                      name={name}
                      accept="image/png, image/jpeg, image/webp"
                      aria-invalid={fieldState.invalid}
                      className="sr-only"
                      onBlur={onBlur}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
                          setImagePreview((prev) => {
                            if (prev?.startsWith("blob:"))
                              URL.revokeObjectURL(prev);
                            return URL.createObjectURL(file);
                          });
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
