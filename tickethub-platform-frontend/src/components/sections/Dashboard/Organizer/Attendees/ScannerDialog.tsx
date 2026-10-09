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
import type { CheckInTicketResponse } from "@/utils/services/organizers/tickets.service";
import Scanner, { type ScannerHandle } from "./Scanner";

type ScanResult =
  | (CheckInTicketResponse & { status: "valid" | "already_used" })
  | { status: "invalid"; message: string; ticketIdentifier: string }
  | null;

interface Props {
  eventId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanned: () => void;
}

const SCAN_COOLDOWN_MS = 1800;

const statusLabels = {
  valid: "Valid",
  already_used: "Already Used",
  invalid: "Invalid",
} as const;

const statusStyles = {
  valid: "bg-green-50 border-green-200 text-green-800",
  already_used: "bg-amber-50 border-amber-200 text-amber-800",
  invalid: "bg-red-50 border-red-200 text-red-800",
} as const;

export default function ScannerDialog({
  eventId,
  open,
  onOpenChange,
  onScanned,
}: Props) {
  const scannerHandleRef = useRef<ScannerHandle>(null);
  const scanLockedRef = useRef(false);
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { mutateAsync: checkInTicket } = useCheckInTicket();
  const [result, setResult] = useState<ScanResult>(null);

  const unlockAfterCooldown = () => {
    if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
    unlockTimerRef.current = setTimeout(() => {
      scanLockedRef.current = false;
      unlockTimerRef.current = null;
    }, SCAN_COOLDOWN_MS);
  };

  const handleDecode = async (decodedText: string) => {
    if (scanLockedRef.current) return;
    scanLockedRef.current = true;

    const identifier = extractTicketIdentifier(decodedText);

    try {
      const scanResult = await checkInTicket({ ticketIdentifier: identifier, eventId });
      setResult(scanResult);

      if (scanResult.status === "valid") onScanned();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Check-in failed.";
      setResult({ status: "invalid", message: msg, ticketIdentifier: identifier });
      logger.error(`${err}`);
    } finally {
      unlockAfterCooldown();
    }
  };

  const handleScannerError = (message: string) => {
    setResult({ status: "invalid", message, ticketIdentifier: "" });
  };

  const handleOpenChange = async (nextOpen: boolean) => {
    if (!nextOpen) {
      setResult(null);
      scanLockedRef.current = false;
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
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
            <div className={`rounded-lg border p-3 text-sm ${statusStyles[result.status]}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{statusLabels[result.status]}</p>
                {result.ticketIdentifier && <p className="font-mono text-xs">{result.ticketIdentifier}</p>}
              </div>
              <p className="mt-1 font-medium">{result.message}</p>
              {"attendeeName" in result && (
                <div className="mt-3 space-y-1 text-xs">
                  <p><span className="font-semibold">Attendee:</span> {result.attendeeName || "Unnamed attendee"}</p>
                  <p><span className="font-semibold">Ticket type:</span> {result.ticketType || "Not specified"}</p>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
