import { useState } from "react";
import { useAdminPayouts, useInitiatePayout, useSetPayoutDetails } from "@/hooks/admin/useAdminPayouts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

export default function AdminPayoutsSection() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminPayouts(page);
  const [showPayout, setShowPayout] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [payoutOrgId, setPayoutOrgId] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [bankOrgId, setBankOrgId] = useState("");
  const [method, setMethod] = useState<"bank" | "mobile_money">("bank");
  const [bankName, setBankName] = useState("");
  const [acctNum, setAcctNum] = useState("");
  const [acctName, setAcctName] = useState("");
  const [momoProvider, setMomoProvider] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [momoName, setMomoName] = useState("");
  const payoutMutation = useInitiatePayout();
  const bankMutation = useSetPayoutDetails();

  const handlePayout = async () => {
    try {
      await payoutMutation.mutateAsync({ organizerId: Number(payoutOrgId), amount: Number(payoutAmount) });
      toast.success("Payout initiated");
      setShowPayout(false);
      setPayoutOrgId(""); setPayoutAmount("");
    } catch { toast.error("Failed to initiate payout"); }
  };

  const handleBank = async () => {
    try {
      await bankMutation.mutateAsync({
        organizerId: Number(bankOrgId), payoutMethod: method,
        bankName: method === "bank" ? bankName : undefined,
        accountNumber: method === "bank" ? acctNum : undefined,
        accountName: method === "bank" ? acctName : undefined,
        mobileMoneyProvider: method === "mobile_money" ? momoProvider : undefined,
        mobileMoneyNumber: method === "mobile_money" ? momoNumber : undefined,
        mobileMoneyName: method === "mobile_money" ? momoName : undefined,
      });
      toast.success("Payout details saved");
      setShowBank(false); setBankOrgId(""); setBankName(""); setAcctNum(""); setAcctName(""); setMomoProvider(""); setMomoNumber(""); setMomoName("");
    } catch { toast.error("Failed to save payout details"); }
  };

  const pagination = data?.pagination;

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Payouts & Settlements</h1>
        <div className="space-x-2">
          <Button size="sm" variant="outline" onClick={() => setShowBank(true)}><PlusIcon className="h-3 w-3 mr-1" /> Set Recipient</Button>
          <Button size="sm" onClick={() => setShowPayout(true)}><PlusIcon className="h-3 w-3 mr-1" /> Initiate Payout</Button>
        </div>
      </div>
      {isLoading ? <div className="flex justify-center py-8"><Loader2Icon className="h-6 w-6 animate-spin" /></div> : (
        <>
          <div className="rounded-md border max-h-100 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Organizer</TableHead><TableHead>Amount</TableHead><TableHead>Reference</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {!data?.data?.length ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No payouts yet</TableCell></TableRow>
                ) : (
                  data.data.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.organizerFirstName ? `${p.organizerFirstName} ${p.organizerLastName}` : "—"}</TableCell>
                      <TableCell>GH₵ {Number(p.amount).toLocaleString()}</TableCell>
                      <TableCell className="text-xs">{p.reference}</TableCell>
                      <TableCell><Badge variant={p.status === "Completed" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                      <TableCell>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground self-center">Page {page} of {pagination.totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </>
      )}

      <Dialog open={showPayout} onOpenChange={setShowPayout}>
        <DialogContent>
          <DialogHeader><DialogTitle>Initiate Payout</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Organizer ID</Label><Input type="number" value={payoutOrgId} onChange={(e) => setPayoutOrgId(e.target.value)} /></div>
            <div><Label>Amount (GHS)</Label><Input type="number" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayout(false)}>Cancel</Button>
            <Button onClick={handlePayout} disabled={!payoutOrgId || !payoutAmount}>Send Payout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBank} onOpenChange={setShowBank}>
        <DialogContent>
          <DialogHeader><DialogTitle>Set Payout Recipient</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Organizer ID</Label><Input type="number" value={bankOrgId} onChange={(e) => setBankOrgId(e.target.value)} /></div>
            <div><Label>Method</Label><Select value={method} onValueChange={(v) => { if (v === "bank" || v === "mobile_money") setMethod(v); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bank">Bank Transfer</SelectItem><SelectItem value="mobile_money">Mobile Money</SelectItem></SelectContent></Select></div>
            {method === "bank" ? (
              <><div><Label>Bank Name</Label><Input value={bankName} onChange={(e) => setBankName(e.target.value)} /></div><div><Label>Account Number</Label><Input value={acctNum} onChange={(e) => setAcctNum(e.target.value)} /></div><div><Label>Account Name</Label><Input value={acctName} onChange={(e) => setAcctName(e.target.value)} /></div></>
            ) : (
              <><div><Label>Provider (MTN/VOD/AIRT)</Label><Input value={momoProvider} onChange={(e) => setMomoProvider(e.target.value)} /></div><div><Label>Phone Number</Label><Input value={momoNumber} onChange={(e) => setMomoNumber(e.target.value)} /></div><div><Label>Account Name</Label><Input value={momoName} onChange={(e) => setMomoName(e.target.value)} /></div></>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBank(false)}>Cancel</Button>
            <Button onClick={handleBank} disabled={!bankOrgId}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
