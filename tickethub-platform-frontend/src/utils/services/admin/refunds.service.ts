import { axiosInstance } from "@/utils/api/axiosInstance";

export type Refund = {
  id: number;
  paymentId: number | null;
  amount: string;
  reason: string;
  status: string;
  rejectionReason: string | null;
  requestedAt: string;
  approvedAt: string | null;
};

export type RefundsResponse = {
  data: Refund[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
};

export async function getRefunds(
  page = 1,
  pageSize = 10,
): Promise<RefundsResponse> {
  const response = await axiosInstance.get("admin/refunds", {
    params: { page, pageSize },
  });
  return response.data;
}

export async function getPendingRefundRequests(): Promise<{
  data: Refund[];
}> {
  const response = await axiosInstance.get("admin/refunds/requests");
  return response.data;
}

export async function approveRefund(
  refundId: number,
): Promise<{ message: string }> {
  const response = await axiosInstance.patch(
    `admin/refunds/${refundId}/approve`,
  );
  return response.data;
}

export async function rejectRefund(
  refundId: number,
  reason: string,
): Promise<{ message: string }> {
  const response = await axiosInstance.patch(
    `admin/refunds/${refundId}/reject`,
    { reason },
  );
  return response.data;
}
