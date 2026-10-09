import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useCheckInTicket,
  useInvalidateIssuedTicket,
  useResendTicketEmail,
} from "@/hooks/organizers/useOrganizerEventTickets";
import { Ban, Check, RefreshCw, Send, Stamp } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import SwapTicketDialog from "./SwapTicketDialog";

type Props = {
  eventId: number;
  orderId: string;
  ticketIdentifier: string;
  isCheckedIn: boolean;
};

const AttendeesTableActions = ({
  eventId,
  ticketIdentifier,
  orderId,
  isCheckedIn,
}: Props) => {
  const { mutate: checkInManually } = useCheckInTicket();
  const invalidateTicket = useInvalidateIssuedTicket();
  const resendTicket = useResendTicketEmail();
  const [manualCheckInOpen, setManualCheckInOpen] = useState(false);
  const [invalidateOpen, setInvalidateOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        disabled={resendTicket.isSuccess}
        onClick={() => resendTicket.mutate(orderId)}
        className="dark:text-white underline cursor-pointer"
        size="xs"
        variant="link"
      >
        {resendTicket.isPending ? <Spinner /> : resendTicket.isSuccess ? <Check /> : <Send />}
        {resendTicket.isSuccess ? "Ticket Sent" : "Resend"}
      </Button>

      {!isCheckedIn && (
        <>
          <Button onClick={() => setSwapOpen(true)} size="xs" variant="outline">
            <RefreshCw /> Swap
          </Button>
          <Button onClick={() => setManualCheckInOpen(true)} size="xs">
            <Stamp /> Check-in
          </Button>
          <Button
            onClick={() => setInvalidateOpen(true)}
            size="xs"
            variant="destructive"
          >
            <Ban /> Invalidate
          </Button>
        </>
      )}

      <ConfirmDialog
        open={manualCheckInOpen}
        onOpenChange={setManualCheckInOpen}
        title="Manual Check-in"
        description={
          <>
            This ticket <span className="text-primary">{ticketIdentifier}</span>{" "}
            will be manually checked-in.
          </>
        }
        confirmText="Manual check-in"
        variant="default"
        onConfirm={() => {
          checkInManually(ticketIdentifier);
          setManualCheckInOpen(false);
        }}
      />

      <ConfirmDialog
        open={invalidateOpen}
        onOpenChange={setInvalidateOpen}
        title="Invalidate Ticket"
        description="This keeps the record but makes the QR code unusable."
        confirmText="Invalidate"
        variant="destructive"
        onConfirm={() => {
          invalidateTicket.mutate({ ticketIdentifier });
          setInvalidateOpen(false);
        }}
      />

      <SwapTicketDialog
        eventId={eventId}
        ticketIdentifier={ticketIdentifier}
        open={swapOpen}
        onOpenChange={setSwapOpen}
      />
    </div>
  );
};

export default AttendeesTableActions;