import type { CheckoutFormData } from "@/components/sections/Checkout/CheckoutForm";
import type { PurchaseTicketRequest } from "@/utils/services/tickets.service";
import { useTicketCartStore } from "@/stores/tickets.store";

export function buildCheckoutPayload(
  form: CheckoutFormData,
): PurchaseTicketRequest {
  const { items } = useTicketCartStore.getState();

  return {
    attendee: {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phoneNumber: form.phone,
    },

    items: items.map((item) => ({
      eventTicketId: item.eventTicketId,
      quantity: item.quantity,
    })),
  };
}
