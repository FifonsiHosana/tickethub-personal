import { toast } from "sonner";
import { useNavigate } from "react-router";
import type { CheckoutFormData } from "@/components/sections/Checkout/CheckoutForm";
import { buildCheckoutPayload } from "@/utils/checkout/checkout.utils";
import { useTicketCartStore } from "@/stores/tickets.store";
import PayStackPop from "@paystack/inline-js";
import type {
  PurchaseTicketResponse,
  PurchaseTicketRequest,
} from "@/utils/services/attendees/tickets.service";
import {
  type initiatePaystackPaymentResponse,
  type purchaseTicketPaymentInput,
} from "@/utils/services/attendees/finance.service";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";

interface CheckoutProps {
  createTicketPurchaseOrder: UseMutateAsyncFunction<
    PurchaseTicketResponse,
    Error,
    PurchaseTicketRequest,
    unknown
  >;
  initiatePaymentForPurchaseOrder: UseMutateAsyncFunction<
    initiatePaystackPaymentResponse,
    Error,
    purchaseTicketPaymentInput,
    unknown
  >;
}

export function useCheckout({
  createTicketPurchaseOrder,
  initiatePaymentForPurchaseOrder,
}: CheckoutProps) {
  const navigate = useNavigate();
  const { clearCart, items, totalTicketAmount } = useTicketCartStore();
  const handleTicketOrderPurchase = async (formData: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error("Cart is empty.");
      return;
    }
    try {
      const payload = buildCheckoutPayload(formData);
      const response = await createTicketPurchaseOrder(payload);
      console.log(response);
      toast.success("Order created successfully.");
      clearCart();

      const payment = await initiatePaymentForPurchaseOrder({
        email: payload.attendee.email,
        orderId: response.orderId,
        phoneNumber: payload.attendee.phoneNumber,
        totalAmount: totalTicketAmount,
      });

      if (!payment) return;

      const popup = new PayStackPop();

      popup.resumeTransaction(payment.access_code, {
        onSuccess: (transaction) => {
          console.log(transaction);
          toast.success("Payment successful.");
          navigate(`/success?reference=${transaction.reference}`);
          clearCart();
        },
        onCancel: () => {
          toast.error("Payment cancelled.");
          navigate("/cancel");
        },
      });
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create ticket order.",
      );
    }
  };

  return {
    handleTicketOrderPurchase,
  };
}
