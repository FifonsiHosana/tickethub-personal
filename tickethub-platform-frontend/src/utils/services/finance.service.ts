import { axiosInstance } from "@/utils/api/axiosInstance";

export type purchaseTicketPaymentInput = {
  orderId: number;
  totalAmount: number;
  email: string;
  phoneNumber: string;
};

export type initiatePaystackPaymentResponse = {
  checkout_url: string;
  reference: string;
  access_code: string;
};

export const purchaseTicketPayment = async (
  input: purchaseTicketPaymentInput
) => {
  const response = await axiosInstance.post("/api/finance", input);

  return response.data.data;
};
