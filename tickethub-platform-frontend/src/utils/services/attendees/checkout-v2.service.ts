import { axiosInstance } from '@/utils/api/axiosInstance';
import type { PurchaseTicketRequest } from './tickets.service';

export interface CheckoutV2Response {
  orderId: number;
  reference: string;
  checkoutUrl: string;
  access_code: string;
  subtotal: number;
  feeAmount: number;
  totalAmount: number;
}

export async function initiateCheckoutV2(
  payload: PurchaseTicketRequest,
): Promise<CheckoutV2Response> {
  const response = await axiosInstance.post('/v2/checkout', payload);
  return response.data.data;
}
