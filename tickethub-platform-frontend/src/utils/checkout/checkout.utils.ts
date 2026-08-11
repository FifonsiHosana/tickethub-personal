import type { CheckoutFormData } from "@/components/sections/Checkout/CheckoutForm";
import type { PurchaseTicketRequest } from "@/utils/services/attendees/tickets.service";
import { useTicketCartStore } from "@/stores/tickets.store";

export function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

export function computeTotalWithFee(subtotal: number, feePercent: number) {
  const feeAmount = roundToTwo((subtotal * feePercent) / 100);

  return { feeAmount, total: roundToTwo(subtotal + feeAmount) };
}

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
