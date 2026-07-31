import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminEvents, useApproveEvent, useRejectEvent } from "@/hooks/admin/useAdminEvents";
import { EventsTable } from "./EventsTable";
import { ApprovalQueueTable } from "./ApprovalQueueTable";
import { toast } from "sonner";

export default function AdminEventsSection() {
  const [tab, setTab] = useState("all");
  const [allPage, setAllPage] = useState(1);
  const [allSearch, setAllSearch] = useState("");
  const [approvalPage, setApprovalPage] = useState(1);
  const { data: allData, isLoading: allLoading } = useAdminEvents({ page: allPage, pageSize: 5, search: allSearch || undefined });
  const { data: pendingData, isLoading: pendingLoading } = useAdminEvents({ approvalStatus: "Pending", page: approvalPage, pageSize: 10 });
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

  return (
    <div className="space-y-3 p-1">
      <h1 className="text-xl font-bold">Event Management</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="approvals">Approval Queue ({pendingData?.data?.length ?? 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <EventsTable
            data={allData}
            isLoading={allLoading}
            page={allPage}
            onPageChange={setAllPage}
            search={allSearch}
            onSearchChange={(val) => { setAllSearch(val); setAllPage(1); }}
          />
        </TabsContent>
        <TabsContent value="approvals">
          <ApprovalQueueTable
            data={pendingData}
            isLoading={pendingLoading}
            page={approvalPage}
            onPageChange={setApprovalPage}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
