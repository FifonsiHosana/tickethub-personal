import { usePayoutDetails } from "@/hooks/organizers/useOrganizerPayoutDetails";
import { PayoutSettingsForm } from "./PayoutSettingsForm";

export default function PayoutSettingsSection() {
  const { data, isLoading } = usePayoutDetails();

  if (isLoading) {
    return <div className="h-32 bg-muted animate-pulse rounded-xl max-w-lg" />;
  }

  return <PayoutSettingsForm details={data?.data} />;
}