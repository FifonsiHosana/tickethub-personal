import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminUsers, useVerificationQueue, useSuspendUser, useVerifyOrganizer } from "@/hooks/admin/useAdminUsers";
import { OrganizersTable } from "./OrganizersTable";
import { VerificationQueueTable } from "./VerificationQueueTable";
import { toast } from "sonner";

export default function AdminOrganizersSection() {
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [vqPage, setVqPage] = useState(1);
  const [vqSearch, setVqSearch] = useState("");
  const { data: orgData, isLoading: orgsLoading } = useAdminUsers({ role: "organizer", page, pageSize: 10, search: search || undefined });
  const { data: queueData, isLoading: queueLoading } = useVerificationQueue({ page: vqPage, pageSize: 10, search: vqSearch || undefined });
  const suspendMutation = useSuspendUser();
  const verifyMutation = useVerifyOrganizer();

  const handleSuspend = async (userId: number, isActive: boolean) => {
    try {
      await suspendMutation.mutateAsync({ userId, isActive });
      toast.success(isActive ? "Organizer reactivated" : "Organizer suspended");
    } catch { toast.error("Failed to update organizer status"); }
  };

  const handleVerify = async (userId: number) => {
    try {
      await verifyMutation.mutateAsync(userId);
      toast.success("Organizer verified successfully");
    } catch { toast.error("Failed to verify organizer"); }
  };

  return (
    <div className="space-y-3 p-1">
      <h1 className="text-xl font-bold">Organizer Management</h1>
      <Tabs value={tab} onValueChange={(v) => { setTab(v); setVqPage(1); }}>
        <TabsList>
          <TabsTrigger value="all">All Organizers</TabsTrigger>
          <TabsTrigger value="verify">Verification Queue ({queueData?.pagination?.total ?? 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <OrganizersTable
            data={orgData}
            isLoading={orgsLoading}
            page={page}
            onPageChange={setPage}
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(1); }}
            onSuspend={handleSuspend}
            onVerify={handleVerify}
          />
        </TabsContent>
        <TabsContent value="verify">
          <VerificationQueueTable
            data={queueData}
            isLoading={queueLoading}
            page={vqPage}
            onPageChange={setVqPage}
            search={vqSearch}
            onSearchChange={(val) => { setVqSearch(val); setVqPage(1); }}
            onVerify={handleVerify}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
