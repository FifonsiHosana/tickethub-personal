import { useMutation } from '@tanstack/react-query';
import { initiateCheckoutV2 } from '@/utils/services/attendees/checkout-v2.service';

export function useInitiateCheckoutV2() {
  return useMutation({
    mutationFn: initiateCheckoutV2,
  });
}
