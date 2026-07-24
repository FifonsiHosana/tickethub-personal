import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCheckInTicket } from "@/hooks/organizers/useOrganizerEventTickets";
import { logger } from "@/utils/logger";
import { extractTicketIdentifier } from "@/utils/tickets";
import Scanner, { type ScannerHandle } from "./Scanner";

type ScanResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string }
  | null;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanned: () => void;
}

export default function ScannerDialog({
  open,
  onOpenChange,
  onScanned,
}: Props) {
  const scannerHandleRef = useRef<ScannerHandle>(null);
  const { mutateAsync: checkInTicket } = useCheckInTicket();
  const [result, setResult] = useState<ScanResult>(null);

  const handleDecode = async (decodedText: string) => {
    const identifier = extractTicketIdentifier(decodedText);

    try {
      await checkInTicket(identifier);
      setResult({ status: "success", message: `Ticket checked in.` });
      onScanned();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Check-in failed.";
      setResult({ status: "error", message: msg });
      logger.error(`${err}`);
    }
  };

  const handleScannerError = (message: string) => {
    setResult({ status: "error", message });
  };

  const handleOpenChange = async (nextOpen: boolean) => {
    if (!nextOpen) {
      setResult(null);
      await scannerHandleRef.current?.stop();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Ticket</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {open && (
            <Scanner
              ref={scannerHandleRef}
              onDecode={handleDecode}
              onError={handleScannerError}
            />
          )}
          {result && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                result.status === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {result.message}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
