import { axiosInstance } from "@/utils/api/axiosInstance";

export type purchaseTicketPaymentInput = {
  orderId: number;
  totalAmount: number;
  email: string;
  phoneNumber: string;
};

export type initiatePaystackPaymentResponse = {
  checkoutUrl: string;
  reference: string;
  access_code: string;
  subtotal: number;
  feeAmount: number;
  totalAmount: number;
};

export const purchaseTicketPayment = async (
  input: purchaseTicketPaymentInput
) => {
  const response = await axiosInstance.post("/finance", input);

  return response.data.data;
};
