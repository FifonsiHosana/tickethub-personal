import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminEvents, useApproveEvent, useRejectEvent } from "@/hooks/admin/useAdminEvents";
import { EventsTable } from "./EventsTable";
import { ApprovalQueueTable } from "./ApprovalQueueTable";
import { toast } from "sonner";

export default function AdminEventsSection() {
  const [tab, setTab] = useState("all");
  const { data: pendingData, isLoading: pendingLoading } = useAdminEvents({ approvalStatus: "Pending", pageSize: 20 });
  const { data: allData, isLoading: allLoading } = useAdminEvents({ pageSize: 20 });
  const approveMutation = useApproveEvent();
  const rejectMutation = useRejectEvent();

  const handleApprove = async (eventId: number) => {
    try {
      await approveMutation.mutateAsync(eventId);
      toast.success("Event approved and published");
    } catch { toast.error("Failed to approve event"); }
  };

  const handleReject = async (eventId: number, reason: string) => {
    try {
      await rejectMutation.mutateAsync({ eventId, reason });
      toast.success("Event rejected");
    } catch { toast.error("Failed to reject event"); }
  };

  const pending = pendingData?.data ?? [];
  const all = allData?.data ?? [];

  return (
    <div className="space-y-3 p-1">
      <h1 className="text-xl font-bold">Event Management</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All Events ({all.length})</TabsTrigger>
          <TabsTrigger value="approvals">Approval Queue ({pending.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <EventsTable events={all} isLoading={allLoading} />
        </TabsContent>
        <TabsContent value="approvals">
          <ApprovalQueueTable events={pending} isLoading={pendingLoading} onApprove={handleApprove} onReject={handleReject} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
