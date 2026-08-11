import { useQuery } from "@tanstack/react-query";
import { fetchPublicSettings } from "@/utils/services/settings.service";

export const DEFAULT_PROCESSING_FEE_PERCENTAGE = 2;

export const useProcessingFeePercentage = () => {
  const query = useQuery({
    queryKey: ["public-settings"],
    staleTime: Infinity,
    queryFn: fetchPublicSettings,
  });

  return (
    query.data?.processing_fee_percentage ??
    DEFAULT_PROCESSING_FEE_PERCENTAGE
  );
};