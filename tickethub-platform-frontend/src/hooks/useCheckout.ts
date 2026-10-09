import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import type { CheckoutFormData } from '@/components/sections/Checkout/CheckoutForm';
import { buildCheckoutPayload } from '@/utils/checkout/checkout.utils';
import { useTicketCartStore } from '@/stores/tickets.store';
import PayStackPop from '@paystack/inline-js';
import {
  setSessionItem,
  GUEST_CHECKOUT_EMAIL_KEY,
} from '@/utils/storage/sessionStorage';
import type { PurchaseTicketRequest } from '@/utils/services/attendees/tickets.service';
import type { CheckoutV2Response } from '@/utils/services/attendees/checkout-v2.service';
import type { UseMutateAsyncFunction } from '@tanstack/react-query';

interface CheckoutProps {
  initiateCheckout: UseMutateAsyncFunction<
    CheckoutV2Response,
    Error,
    PurchaseTicketRequest,
    unknown
  >;
}

export function useCheckout({ initiateCheckout }: CheckoutProps) {
  const navigate = useNavigate();
  const { clearCart, items } = useTicketCartStore();

  const handleTicketOrderPurchase = async (formData: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error('Cart is empty.');
      return;
    }

    try {
      const payload = buildCheckoutPayload(formData);
      const checkout = await initiateCheckout(payload);
      setSessionItem(GUEST_CHECKOUT_EMAIL_KEY, payload.attendee.email);

      const popup = new PayStackPop();
      popup.resumeTransaction(checkout.access_code, {
        onSuccess: (transaction) => {
          toast.success('Payment successful.');
          clearCart();
          navigate(`/success?reference=${transaction.reference}`);
        },
        onCancel: () => {
          toast.error('Payment cancelled.');
          navigate('/cancel');
        },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to start checkout.',
      );
    }
  };

  return { handleTicketOrderPurchase };
}
