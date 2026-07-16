import { toast } from "sonner";
import { useNavigate } from "react-router";
import type { CheckoutFormData } from "@/components/sections/Checkout/CheckoutForm";
import { buildCheckoutPayload } from "@/utils/checkout/checkout.utils";
import { useTicketCartStore } from "@/stores/tickets.store";
import type {
  PurchaseTicketResponse,
  PurchaseTicketRequest,
} from "@/utils/services/tickets.service";
import {
  //   purchaseTicketPayment,
  type purchaseTicketPaymentInput,
} from "@/utils/services/finance.service";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";

interface CheckoutProps {
  createTicketPurchaseOrder: UseMutateAsyncFunction<
    PurchaseTicketResponse,
    Error,
    PurchaseTicketRequest,
    unknown
  >;
  initiatePaymentForPurchaseOrder: UseMutateAsyncFunction<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    Error,
    purchaseTicketPaymentInput,
    unknown
  >;
}

export function useCheckout({ createTicketPurchaseOrder }: CheckoutProps) {
  const navigate = useNavigate();
  const { clearCart, items } = useTicketCartStore();
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

      // TODO:
      // Initialize payment here when integrated.
      //   const payment = await initiatePaymentForPurchaseOrder({
      //     email: response.email,
      //     orderId: response.orderId,
      //     phoneNumber: response.phoneNumber,
      //     amount: response.totalAmount,
      //   })

      navigate(`/`);
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
