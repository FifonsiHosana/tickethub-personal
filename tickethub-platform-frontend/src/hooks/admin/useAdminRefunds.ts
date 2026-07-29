import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRefunds,
  getPendingRefundRequests,
  approveRefund,
  rejectRefund,
} from "@/utils/services/admin/refunds.service";

export function useAdminRefunds(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["admin-refunds", page, pageSize],
    queryFn: () => getRefunds(page, pageSize),
    placeholderData: (prev) => prev,
  });
}

export function usePendingRefundRequests() {
  return useQuery({
    queryKey: ["admin-refunds-pending"],
    queryFn: getPendingRefundRequests,
  });
}

export function useApproveRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (refundId: number) => approveRefund(refundId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-refunds"] });
      queryClient.invalidateQueries({ queryKey: ["admin-refunds-pending"] });
    },
  });
}

export function useRejectRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      refundId,
      reason,
    }: {
      refundId: number;
      reason: string;
    }) => rejectRefund(refundId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-refunds"] });
      queryClient.invalidateQueries({ queryKey: ["admin-refunds-pending"] });
    },
  });
}
