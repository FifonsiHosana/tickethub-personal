import { axiosInstance } from "@/utils/api/axiosInstance";

export type PayoutDetails = {
  id: number;
  organizerId: number;
  payoutMethod: "bank" | "mobile_money";
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  mobileMoneyProvider: string | null;
  mobileMoneyNumber: string | null;
  mobileMoneyName: string | null;
  recipientCode: string | null;
};

export type SetPayoutDetailsPayload = {
  payoutMethod: "bank" | "mobile_money";
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  mobileMoneyName?: string;
};

export async function getPayoutDetails(): Promise<{ success: boolean; data: PayoutDetails | null }> {
  const response = await axiosInstance.get("organizer/payout-details");
  return response.data;
}

export async function updatePayoutDetails(payload: SetPayoutDetailsPayload): Promise<{ success: boolean; message: string }> {
  const response = await axiosInstance.put("organizer/payout-details", payload);
  return response.data;
}
