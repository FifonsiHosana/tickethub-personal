import { Button } from "@/components/ui/button";
import {
  useCheckInTicket,
  useResendTicketEmail,
} from "@/hooks/organizers/useOrganizerEventTickets";
import { Check, Send, Stamp } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useState } from "react";

type Props = {
  orderId: string;
  ticketIdentifier: string;
  isCheckedIn: boolean;
};

const AttendeesTableActions = ({
  ticketIdentifier,
  orderId,
  isCheckedIn,
}: Props) => {
  const { mutate: check_user_in_manually } = useCheckInTicket();

  const {
    mutate: resend_ticket_email,
    isPending,
    isSuccess,
  } = useResendTicketEmail();

  const [manualCheckInOpen, setManualCheckInOpen] = useState(false);

  return (
    <div className="flex gap-2">
      <Button
        disabled={isSuccess}
        onClick={() => resend_ticket_email(orderId)}
        className={"dark:text-white underline cursor-pointer"}
        size={"xs"}
        variant={"link"}
      >
        {isPending ? <Spinner /> : isSuccess ? <Check /> : <Send />}
        {isSuccess ? `Ticket Sent` : `Resend Ticket`}
      </Button>

      {!isCheckedIn && (
        <Button
          onClick={() => setManualCheckInOpen(true)}
          className={"text-white"}
          size={"xs"}
        >
          <Stamp /> check-in
        </Button>
      )}

      <ConfirmDialog
        open={manualCheckInOpen}
        onOpenChange={setManualCheckInOpen}
        title="Manual Check-in"
        description="This ticket will be manually checked-in."
        confirmText="Manual check-in"
        variant="default"
        onConfirm={() => {
          check_user_in_manually(ticketIdentifier);
          setManualCheckInOpen(false);
        }}
      />
    </div>
  );
};

export default AttendeesTableActions;
