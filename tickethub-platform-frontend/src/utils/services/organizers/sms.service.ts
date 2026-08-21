import { axiosInstance } from "@/utils/api/axiosInstance";

export interface SmsHistoryItem {
  id: string;
  userId: string;
  message: string;
  recipients: string;
  sender: string;
  status: "sent" | "delivered" | "failed" | "pending" | "scheduled" | "draft";
  scheduledAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
  eventId?: number | null;
}

export interface SendSmsPayload {
  message: string;
  recipients: string[];
  sender?: string;
  scheduled?: boolean;
  scheduleDate?: string | null;
  meta?: {
    selectedEventId?: number | string | null;
    audienceMode?: string;
    selectedGroupIds?: number[];
    audienceLabel?: string;
  };
}

export interface CreditPurchasePayload {
  credits: number;
  amount: number;
  currency?: string;
  email?: string;
  planName?: string;
}

export interface CreditPurchaseResponse {
  checkoutUrl?: string;
  reference?: string;
  accessCode?: string;
  access_code?: string;
  mock?: boolean;
  message?: string;
}

export async function getSmsHistory(): Promise<SmsHistoryItem[]> {
  const response = await axiosInstance.get("/organizer/sms/history");
  const payload = response?.data;
  const data = Array.isArray(payload) ? payload : (payload?.data ?? payload);

  return Array.isArray(data) ? data : [];
}

export async function sendSms(payload: SendSmsPayload) {
  const response = await axiosInstance.post("/organizer/sms", payload);
  const data = response?.data?.data ?? response?.data;
  return data;
}

export async function getCreditWallet() {
  const response = await axiosInstance.get("/organizer/sms/balance");
  const data = response?.data?.data ?? response?.data;
  return data;
}

export async function buyCredits(payload: CreditPurchasePayload) {
  const response = await axiosInstance.post(
    "/organizer/credit/purchase",
    payload,
  );
  const data = response?.data?.data ?? response?.data;
  return data;
}

export async function verifyCreditPurchase(reference: string): Promise<{
  totalCredit: string;
  creditUsed: string;
  creditLeft: string;
}> {
  const response = await axiosInstance.post("/organizer/credit/verify", {
    reference,
  });
  const data = response?.data?.data ?? response?.data;
  return data;
}

export interface CreditTransactionRecord {
  id: number;
  userId: number;
  reference: string;
  credits: string;
  type: "purchase" | "deduction" | string;
  createdAt: string | null;
}

export async function getCreditTransactions(): Promise<
  CreditTransactionRecord[]
> {
  const response = await axiosInstance.get("/organizer/credit/transactions");
  const data = response?.data?.data ?? response?.data;
  return Array.isArray(data) ? data : [];
}
