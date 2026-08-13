import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { TicketTypeSelect } from "./TicketTypeSelect";
import type { CreateTicketPayload, TicketResponse, UpdateTicketPayload } from "@/utils/services/organizers/tickets.service";

interface Props {
  ticket: TicketResponse | null;
  onSaveAdd: (payload: CreateTicketPayload) => Promise<void>;
  onSaveEdit: (payload: UpdateTicketPayload) => Promise<void>;
}

const toLocalInput = (iso: string | null) => (iso ? iso.slice(0, 16) : "");
const toIsoString = (local: string) => new Date(local).toISOString();

export function TicketFormFields({ ticket, onSaveAdd, onSaveEdit }: Props) {
  const editing = !!ticket;

  const schema = z.object({
    name: z.string().trim().min(3, "Ticket name must be at least 3 characters"),
    price: z.coerce.number().positive("Price must be greater than 0"),
    totalCount: z.preprocess(
      (value) => (value === "" || value === undefined ? undefined : value),
      z.coerce.number().int().positive("Quantity must be a positive number").optional(),
    ),
    benefits: z.string().optional(),
    salesStartDate: z.string().optional(),
    salesEndDate: z.string().optional(),
    ticketTypeId: z.number().int().positive("Select a ticket type").nullable().optional(),
  }).superRefine((values, ctx) => {
    if (!editing && !values.ticketTypeId) {
      ctx.addIssue({ code: "custom", path: ["ticketTypeId"], message: "Select a ticket type" });
    }
  });

  const { register, control, handleSubmit, formState: { errors, isValid, isSubmitting } } =
    useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
      resolver: zodResolver(schema),
      mode: "onChange",
      defaultValues: {
        name: ticket?.name ?? "",
        ticketTypeId: ticket?.ticketTypeId ?? null,
        price: ticket ? Number(ticket.price) : 0,
        totalCount: ticket?.totalCount,
        benefits: ticket?.benefits ?? "",
        salesStartDate: toLocalInput(ticket?.salesStartDate ?? null),
        salesEndDate: toLocalInput(ticket?.salesEndDate ?? null),
      },
    });

  const onSubmit = handleSubmit(async (values) => {
    const base = {
      name: values.name,
      price: values.price,
      ...(values.totalCount ? { totalCount: values.totalCount } : {}),
      ...(values.benefits?.trim() ? { benefits: values.benefits.trim() } : {}),
      ...(values.salesStartDate ? { salesStartDate: toIsoString(values.salesStartDate) } : {}),
      ...(values.salesEndDate ? { salesEndDate: toIsoString(values.salesEndDate) } : {}),
    };
    if (editing) return onSaveEdit(base);
    return onSaveAdd({ ...base, ticketTypeId: values.ticketTypeId! });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field>
        <FieldLabel htmlFor="ticket-name">Ticket Name</FieldLabel>
        <FieldContent>
          <Input id="ticket-name" placeholder="Ticket name" {...register("name")} />
          <FieldError errors={[errors.name]} />
        </FieldContent>
      </Field>

      {!editing && (
        <Field>
          <FieldLabel>Ticket Type</FieldLabel>
          <FieldContent>
            <Controller control={control} name="ticketTypeId" render={({ field }) => (
              <TicketTypeSelect value={field.value ?? null} onChange={field.onChange} />
            )} />
            <FieldError errors={[errors.ticketTypeId]} />
          </FieldContent>
        </Field>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="ticket-price">Price (GHS)</FieldLabel>
          <FieldContent>
            <Input id="ticket-price" type="number" step="0.01" min="0" placeholder="0.00" {...register("price")} />
            <FieldError errors={[errors.price]} />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="ticket-qty">Quantity</FieldLabel>
          <FieldContent>
            <Input id="ticket-qty" type="number" min="1" placeholder="1" {...register("totalCount")} />
            <FieldError errors={[errors.totalCount]} />
          </FieldContent>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="ticket-benefits">Benefits (optional)</FieldLabel>
        <FieldContent>
          <Input id="ticket-benefits" placeholder="e.g. Free parking, VIP lounge" {...register("benefits")} />
        </FieldContent>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="ticket-sales-start">Sales Start</FieldLabel>
          <FieldContent>
            <Input id="ticket-sales-start" type="datetime-local" {...register("salesStartDate")} />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="ticket-sales-end">Sales End</FieldLabel>
          <FieldContent>
            <Input id="ticket-sales-end" type="datetime-local" {...register("salesEndDate")} />
          </FieldContent>
        </Field>
      </div>

      <Button type="submit" className="w-full rounded-full bg-primary text-white" disabled={!isValid || isSubmitting}>
        {isSubmitting ? "Saving..." : editing ? "Update Ticket" : "Save Ticket"}
      </Button>
    </form>
  );
}