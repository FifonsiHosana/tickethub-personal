import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminOrganizers, useVerificationQueue, useSuspendUser, useVerifyOrganizer } from "@/hooks/admin/useAdminUsers";
import { OrganizersTable } from "./OrganizersTable";
import { VerificationQueueTable } from "./VerificationQueueTable";
import { toast } from "sonner";

export default function AdminOrganizersSection() {
  const [tab, setTab] = useState("all");
  const { data: organizers, isLoading: orgsLoading } = useAdminOrganizers();
  const { data: queue, isLoading: queueLoading } = useVerificationQueue();
  const suspendMutation = useSuspendUser();
  const verifyMutation = useVerifyOrganizer();

  const handleSuspend = async (userId: number, isActive: boolean) => {
    try {
      await suspendMutation.mutateAsync({ userId, isActive });
      toast.success(isActive ? "Organizer reactivated" : "Organizer suspended");
    } catch {
      toast.error("Failed to update organizer status");
    }
  };

  const handleVerify = async (userId: number) => {
    try {
      await verifyMutation.mutateAsync(userId);
      toast.success("Organizer verified successfully");
    } catch {
      toast.error("Failed to verify organizer");
    }
  };

  return (
    <div className="space-y-3 p-1">
      <h1 className="text-xl font-bold">Organizer Management</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All Organizers</TabsTrigger>
          <TabsTrigger value="verify">Verification Queue {queue?.data?.length ? `(${queue.data.length})` : ""}</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <OrganizersTable
            organizers={organizers?.data ?? []}
            isLoading={orgsLoading}
            onSuspend={handleSuspend}
            onVerify={handleVerify}
          />
        </TabsContent>
        <TabsContent value="verify">
          <VerificationQueueTable
            organizers={queue?.data ?? []}
            isLoading={queueLoading}
            onVerify={handleVerify}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
