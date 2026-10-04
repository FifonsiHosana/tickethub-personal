import { useForm } from "react-hook-form";
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
import type {
  CreateTicketPayload,
  TicketResponse,
  UpdateTicketPayload,
} from "@/utils/services/organizers/tickets.service";

interface Props {
  ticket: TicketResponse | null;
  onSaveAdd: (payload: CreateTicketPayload) => Promise<void>;
  onSaveEdit: (payload: UpdateTicketPayload) => Promise<void>;
}

const toLocalInput = (iso: string | null) => (iso ? iso.slice(0, 16) : "");
const toIsoString = (local: string) => new Date(local).toISOString();

const schema = z.object({
  ticketTypeName: z.string().trim().min(2, "Ticket type is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  totalCount: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    z.coerce.number().int().positive("Quantity must be a positive number").optional(),
  ),
  benefits: z.string().optional(),
  salesStartDate: z.string().optional(),
  salesEndDate: z.string().optional(),
});

type FormValues = z.output<typeof schema>;

export function TicketFormFields({ ticket, onSaveAdd, onSaveEdit }: Props) {
  const editing = !!ticket;
  const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } =
    useForm<z.input<typeof schema>, unknown, FormValues>({
      resolver: zodResolver(schema),
      mode: "onChange",
      defaultValues: {
        ticketTypeName: ticket?.ticketType ?? ticket?.name ?? "",
        price: ticket ? Number(ticket.price) : 0,
        totalCount: ticket?.totalCount,
        benefits: ticket?.benefits ?? "",
        salesStartDate: toLocalInput(ticket?.salesStartDate ?? null),
        salesEndDate: toLocalInput(ticket?.salesEndDate ?? null),
      },
    });

  const onSubmit = handleSubmit(async (values) => {
    const base = {
      ticketTypeName: values.ticketTypeName.trim(),
      price: values.price,
      ...(values.totalCount ? { totalCount: values.totalCount } : {}),
      ...(values.benefits?.trim() ? { benefits: values.benefits.trim() } : {}),
      ...(values.salesStartDate ? { salesStartDate: toIsoString(values.salesStartDate) } : {}),
      ...(values.salesEndDate ? { salesEndDate: toIsoString(values.salesEndDate) } : {}),
    };
    return editing ? onSaveEdit(base) : onSaveAdd(base);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field>
        <FieldLabel htmlFor="ticket-type">Ticket type</FieldLabel>
        <FieldContent>
          <Input id="ticket-type" placeholder="Ticket type" {...register("ticketTypeName")} />
          <FieldError errors={[errors.ticketTypeName]} />
        </FieldContent>
      </Field>

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
        <FieldLabel htmlFor="ticket-benefits">Description/Benefits</FieldLabel>
        <FieldContent>
          <Input id="ticket-benefits" placeholder="Description/Benefits" {...register("benefits")} />
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
