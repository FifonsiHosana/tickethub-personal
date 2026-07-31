import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPayoutDetails, updatePayoutDetails } from "@/utils/services/organizers/payout-details.service";
import type { SetPayoutDetailsPayload } from "@/utils/services/organizers/payout-details.service";

export function usePayoutDetails() {
  return useQuery({
    queryKey: ["organizer-payout-details"],
    queryFn: getPayoutDetails,
  });
}

export function useUpdatePayoutDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SetPayoutDetailsPayload) => updatePayoutDetails(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-payout-details"] });
    },
  });
}
