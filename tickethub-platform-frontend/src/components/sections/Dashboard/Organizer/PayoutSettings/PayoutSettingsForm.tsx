import { useState } from "react";
import { useUpdatePayoutDetails } from "@/hooks/organizers/useOrganizerPayoutDetails";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SaveIcon, BanknoteIcon } from "lucide-react";
import { toast } from "sonner";
import { BankDetailsFields } from "./BankDetailsFields";
import { MobileMoneyFields } from "./MobileMoneyFields";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PayoutSettingsForm({ details }: { details: any }) {
  const updateMutation = useUpdatePayoutDetails();

  const [method, setMethod] = useState<"bank" | "mobile_money">(
    details?.payoutMethod || "bank"
  );

  const [bankName, setBankName] = useState(details?.bankName || "");
  const [acctNum, setAcctNum] = useState(details?.accountNumber || "");
  const [acctName, setAcctName] = useState(details?.accountName || "");

  const [momoProvider, setMomoProvider] = useState(
    details?.mobileMoneyProvider || ""
  );
  const [momoNumber, setMomoNumber] = useState(
    details?.mobileMoneyNumber || ""
  );
  const [momoName, setMomoName] = useState(details?.mobileMoneyName || "");

  const handleSave = async () => {
    const payload = {
      payoutMethod: method,
      ...(method === "bank"
        ? { bankName, accountNumber: acctNum, accountName: acctName }
        : {
            mobileMoneyProvider: momoProvider,
            mobileMoneyNumber: momoNumber,
            mobileMoneyName: momoName,
          }),
    };

    try {
      await updateMutation.mutateAsync(payload);
      toast.success("Payout details saved");
    } catch {
      toast.error("Failed to save payout details");
    }
  };

  return (
    <div className="space-y-3 p-1 max-w-lg">
      <h1 className="text-xl font-bold">Payout Settings</h1>
      <p className="text-sm text-muted-foreground">
        Set up how you receive payouts.{" "}
        {details?.recipientCode && "You already have a recipient set up."}
      </p>

      <Card className="shadow-sm">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BanknoteIcon className="h-4 w-4" /> Recipient Details
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 space-y-3">
          <div className="space-y-1">
            <Label>Payout Method</Label>
            <Select
              value={method}
              onValueChange={(v: "bank" | "mobile_money" | null) =>
                setMethod(v as "bank" | "mobile_money")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {method === "bank" ? (
            <BankDetailsFields
              bankName={bankName}
              setBankName={setBankName}
              acctNum={acctNum}
              setAcctNum={setAcctNum}
              acctName={acctName}
              setAcctName={setAcctName}
            />
          ) : (
            <MobileMoneyFields
              momoProvider={momoProvider}
              setMomoProvider={setMomoProvider}
              momoNumber={momoNumber}
              setMomoNumber={setMomoNumber}
              momoName={momoName}
              setMomoName={setMomoName}
            />
          )}

          <Button
            size="sm"
            className="w-full"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            <SaveIcon className="h-3 w-3 mr-1" />{" "}
            {updateMutation.isPending ? "Saving..." : "Save Details"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
