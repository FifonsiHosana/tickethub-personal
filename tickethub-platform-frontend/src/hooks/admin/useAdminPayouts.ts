import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPayouts,
  initiatePayout,
  setPayoutDetails,
} from "@/utils/services/admin/payouts.service";

export function useAdminPayouts(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["admin-payouts", page, pageSize],
    queryFn: () => getPayouts(page, pageSize),
    placeholderData: (prev) => prev,
  });
}

export function useInitiatePayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      organizerId,
      amount,
    }: {
      organizerId: number;
      amount: number;
    }) => initiatePayout(organizerId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
    },
  });
}

export function useSetPayoutDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      organizerId,
      ...details
    }: {
      organizerId: number;
      payoutMethod: "bank" | "mobile_money";
      bankName?: string;
      accountNumber?: string;
      accountName?: string;
      mobileMoneyProvider?: string;
      mobileMoneyNumber?: string;
      mobileMoneyName?: string;
    }) => setPayoutDetails(organizerId, details),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
    },
  });
}
