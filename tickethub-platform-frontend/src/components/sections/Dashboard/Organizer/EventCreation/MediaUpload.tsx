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
                <FieldContent className="mt-1.5 flex justify-center items-center">
                  <div className="w-full max-w-md ">
                    <label
                      htmlFor={name}
                      className="group relative block w-full cursor-pointer overflow-hidden rounded-xl transition-all h-60"
                    >
                      {imagePreview ? (
                        <div className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-muted/30 shadow-xs">
                          <img
                            src={imagePreview}
                            alt="Flyer Preview"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {/* Hover overlay button */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <span className="rounded-md bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-xs backdrop-blur-xs">
                              Change Image
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 p-4 transition-all hover:border-primary/50 hover:bg-muted/40">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border/60 shadow-xs group-hover:border-primary/30">
                            <ImageIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium text-foreground">
                              <span className="text-primary underline-offset-4 group-hover:underline">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              PNG, JPG or WEBP (max 5MB)
                            </p>
                          </div>
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

