import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MomoFieldsProps {
  momoProvider: string;
  setMomoProvider: (val: string) => void;
  momoNumber: string;
  setMomoNumber: (val: string) => void;
  momoName: string;
  setMomoName: (val: string) => void;
}

export function MobileMoneyFields({
  momoProvider, setMomoProvider,
  momoNumber, setMomoNumber,
  momoName, setMomoName
}: MomoFieldsProps) {
  return (
    <>
      <div className="space-y-1">
        <Label>Mobile Money Provider</Label>
        <Select value={momoProvider} onValueChange={(v) => { if (v) setMomoProvider(v); }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MTN">MTN Mobile Money</SelectItem>
            <SelectItem value="VOD">Vodafone Cash</SelectItem>
            <SelectItem value="AIRT">AirtelTigo Money</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Phone Number</Label>
        <Input 
          value={momoNumber} 
          onChange={(e) => setMomoNumber(e.target.value)} 
          placeholder="e.g. 0551234567" 
        />
      </div>
      <div className="space-y-1">
        <Label>Account Name</Label>
        <Input 
          value={momoName} 
          onChange={(e) => setMomoName(e.target.value)} 
          placeholder="e.g. John Doe" 
        />
      </div>
    </>
  );
}