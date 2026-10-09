import { axiosInstance } from "@/utils/api/axiosInstance";

export interface OrderHistoryParams {
  page?: number;
  pageSize?: number;
  period?: "upcoming" | "past";
}
export interface OrderFromReferenceParams {
  reference: string;
  email?: string;
  phoneNumber?: string;
}

export type OrderHistoryTicket = {
  id: number;
  ticketIdentifier: string;
  qrCodeUrl: string | null;
  ticketType: string;
  holderName: string;
  checkedIn: boolean;
  checkedInAt: string | null;
};

export type OrderHistoryEventBreakdown = {
  eventId: number;
  eventTitle: string;
  eventDate: string | null;
  ticketSummary: string;
  ticketType: string;
  totalTickets: number;
  checkedInCount: number;
  tickets: OrderHistoryTicket[];
};

export type OrderHistoryOrder = {
  orderId: number;
  status: "Completed";
  quantity: number;
  purchasedAt: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhoneNumber: string;
  totalTickets: number;
  checkedInCount: number;
  amount: string | null;
  currency: string | null;
  provider: string | null;
  paymentStatus: "Completed" | "Failed" | null;
  reference: string | null;
  paidAt: string | null;
  events: OrderHistoryEventBreakdown[];
  fromCache?: boolean;
};

export type OrderHistoryResponse = {
  data: OrderHistoryOrder[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  fromCache?: boolean;
};

export type OrderFromReferenceOrder = {
  orderId: number;
  status: "Pending" | "Completed";
  quantity: number;
  purchasedAt: string;
  customer: { firstName: string; lastName: string; email: string; phoneNumber: string };
  payment: { amount: string; currency: string; provider: string };
  tickets: OrderFromReferenceTicket[];
};

export type OrderFromReferenceTicket = {
  id: number;
  identifier: string;
  qrCodeUrl: string;
  checkedIn: boolean;
  eventTicketId: number | null;
  ticketTypeId: number | null;
  ticketTypeName: string | null;
};

const listCacheKey = (params?: OrderHistoryParams) =>
  `attendee-order-history:${params?.period ?? "upcoming"}:${params?.page ?? 1}:${params?.pageSize ?? 10}`;
const detailCacheKey = (orderId: number) => `attendee-order-detail:${orderId}`;

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Cache is best-effort only.
  }
}

export async function getOrderHistory(params?: OrderHistoryParams): Promise<OrderHistoryResponse> {
  const cacheKey = listCacheKey(params);

  try {
    const response = await axiosInstance.get("/attendee/orders", { params });
    writeCache(cacheKey, response.data.data);
    return response.data.data;
  } catch (error) {
    const cached = readCache<OrderHistoryResponse>(cacheKey);
    if (cached) return { ...cached, fromCache: true };
    throw error;
  }
}

export async function getOrderHistoryDetail(orderId: number): Promise<OrderHistoryOrder> {
  const cacheKey = detailCacheKey(orderId);

  try {
    const response = await axiosInstance.get(`/attendee/orders/${orderId}`);
    writeCache(cacheKey, response.data.data);
    return response.data.data;
  } catch (error) {
    const cached = readCache<OrderHistoryOrder>(cacheKey);
    if (cached) return { ...cached, fromCache: true } as OrderHistoryOrder;
    throw error;
  }
}

export async function getOrderFromReference(
  params: OrderFromReferenceParams,
): Promise<OrderFromReferenceOrder> {
  const response = await axiosInstance.get("/attendee/order-from-reference", {
    params,
  });

  return response.data.data;
}