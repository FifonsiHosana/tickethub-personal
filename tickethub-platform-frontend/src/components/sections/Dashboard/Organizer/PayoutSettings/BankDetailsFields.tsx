import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BankFieldsProps {
  bankName: string;
  setBankName: (val: string) => void;
  acctNum: string;
  setAcctNum: (val: string) => void;
  acctName: string;
  setAcctName: (val: string) => void;
}

export function BankDetailsFields({
  bankName, setBankName,
  acctNum, setAcctNum,
  acctName, setAcctName
}: BankFieldsProps) {
  return (
    <>
      <div className="space-y-1">
        <Label>Bank Name</Label>
        <Input 
          value={bankName} 
          onChange={(e) => setBankName(e.target.value)} 
          placeholder="e.g. Access Bank" 
        />
      </div>
      <div className="space-y-1">
        <Label>Account Number</Label>
        <Input 
          value={acctNum} 
          onChange={(e) => setAcctNum(e.target.value)} 
          placeholder="e.g. 0123456789" 
        />
      </div>
      <div className="space-y-1">
        <Label>Account Name</Label>
        <Input 
          value={acctName} 
          onChange={(e) => setAcctName(e.target.value)} 
          placeholder="e.g. John Doe" 
        />
      </div>
    </>
  );
}