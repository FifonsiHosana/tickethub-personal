import { axiosInstance } from "@/utils/api/axiosInstance";

export type purchaseTicketPaymentInput = {
 orderId: number;
 totalAmount: number;
 email: string;
 phoneNumber: string;
}

export const purchaseTicketPayment = async (input: purchaseTicketPaymentInput) => {
    const response= await axiosInstance.post("/api/finance", input);

    return response.data;
}