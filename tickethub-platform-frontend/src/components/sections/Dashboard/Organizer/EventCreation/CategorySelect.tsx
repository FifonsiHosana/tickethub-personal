import { useMemo, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";

import { type CreateEventFormValues } from "@/types/organizer/event.schema";
import { type Category } from "@/types/event.types";
import { useCategories } from "@/hooks/attendees/events/useEvent";
import { useCreateCategory } from "@/hooks/organizers/useOrganizerEvents";
import { Field, FieldLabel, FieldError, FieldContent } from "@/components/ui/field";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";

export function CategorySelect() {
  const {
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<CreateEventFormValues>();
  const { data: categories = [], isLoading } = useCategories();
  const { mutateAsync: create, isPending: isCreating } = useCreateCategory();

  const [query, setQuery] = useState("");
  const [createdCategories, setCreatedCategories] = useState<Category[]>([]);
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allCategories = useMemo(() => {
    const map = new Map<number, Category>();
    for (const cat of categories) map.set(cat.id, cat);
    for (const cat of createdCategories) map.set(cat.id, cat);
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, createdCategories]);

  const trimmedQuery = query.trim();
  const noMatch = trimmedQuery.length > 0 && !allCategories.some(
    (cat) => cat.name.toLowerCase() === trimmedQuery.toLowerCase(),
  );

  function toSelected(ids: number[] | undefined): Category[] {
    return (ids ?? [])
      .map((id) => allCategories.find((cat) => cat.id === id))
      .filter((cat): cat is Category => !!cat);
  }

  async function handleCreate() {
    try {
      const name = trimmedQuery;
      const created = await create({ name });

      setValue(
        "categoryIds",
        [...(getValues("categoryIds") ?? []), created.id],
        { shouldValidate: true },
      );

      if (!createdCategories.some((cat) => cat.id === created.id)) {
        setCreatedCategories((prev) => [...prev, created]);
      }

      toast.success(`Category "${created.name}" added.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create category.";
      toast.error(message);
    }
  }

  return (
    <Field data-invalid={!!errors.categoryIds}>
      <FieldLabel htmlFor="categoryIds">Categories</FieldLabel>
      <FieldContent>
        <Controller
          name="categoryIds"
          control={control}
          render={({ field }) => (
            <Combobox
              items={allCategories}
              multiple
              value={toSelected(field.value)}
              onValueChange={(value: Category[]) => {
                field.onChange(value.map((cat) => cat.id));
              }}
              onInputValueChange={setQuery}
              itemToStringLabel={(cat: Category) => cat.name}
              itemToStringValue={(cat: Category) => cat.name}
            >
              <div ref={anchorRef} className="w-full">
                <ComboboxChips
                  onClick={() => inputRef.current?.focus()}
                  className="w-full"
                >
                  {field.value?.map((cat) => toSelected([cat])[0]).filter(Boolean).map((cat) => (
                    <ComboboxChip key={cat.id}>{cat.name}</ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    ref={inputRef}
                    id="categoryIds"
                    placeholder={
                      isLoading ? "Loading..." : "Search or add categories..."
                    }
                    disabled={isLoading}
                  />
                </ComboboxChips>
              </div>

              <ComboboxContent anchor={anchorRef}>
                <ComboboxEmpty>No categories found.</ComboboxEmpty>
                <ComboboxList>
                  {(cat: Category) => (
                    <ComboboxItem key={cat.id} value={cat}>
                      {cat.name}
                    </ComboboxItem>
                  )}
                </ComboboxList>

                {noMatch && (
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-sm text-primary hover:bg-accent disabled:opacity-60 cursor-pointer"
                  >
                    <PlusIcon className="size-4" />
                    {isCreating
                      ? `Creating "${trimmedQuery}"...`
                      : `Create "${trimmedQuery}"`}
                  </button>
                )}
              </ComboboxContent>
            </Combobox>
          )}
        />
      </FieldContent>
      {errors.categoryIds && <FieldError errors={[errors.categoryIds]} />}
    </Field>
  );
}