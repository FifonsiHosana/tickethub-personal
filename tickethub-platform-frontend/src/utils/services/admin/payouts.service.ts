import { axiosInstance } from "@/utils/api/axiosInstance";

export type Payout = {
  id: number;
  organizerId: number | null;
  amount: string;
  commission: string;
  processingFee: string;
  reference: string;
  status: string;
  paidAt: string | null;
  organizerFirstName: string | null;
  organizerLastName: string | null;
  organizerEmail: string | null;
};

export type PayoutsResponse = {
  data: Payout[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
};

export async function getPayouts(
  page = 1,
  pageSize = 10,
): Promise<PayoutsResponse> {
  const response = await axiosInstance.get("admin/payouts", {
    params: { page, pageSize },
  });
  return response.data;
}

export async function initiatePayout(
  organizerId: number,
  amount: number,
): Promise<{ message: string; payoutId?: number; reference?: string }> {
  const response = await axiosInstance.post("admin/payouts", {
    organizerId,
    amount,
  });
  return response.data;
}

export async function setPayoutDetails(
  organizerId: number,
  details: {
    payoutMethod: "bank" | "mobile_money";
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    mobileMoneyProvider?: string;
    mobileMoneyNumber?: string;
    mobileMoneyName?: string;
  },
): Promise<{ message: string }> {
  const response = await axiosInstance.patch(
    `admin/payouts/organizers/${organizerId}/payout-details`,
    details,
  );
  return response.data;
}
