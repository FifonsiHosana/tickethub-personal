import { useGetTicketByIdentifier } from "@/hooks/attendees/tickets/useTickets";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";

export default function PublicTicket() {
  const { data: ticket, isLoading, error } = useGetTicketByIdentifier();
  if (isLoading) return <Loader loading={true} fullScreen={true} />;

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Ticket Not Found
          </h1>
          <p className="text-neutral-500">
            This ticket could not be found. Please check the link or contact
            support.
          </p>
        </div>
      </div>
    );
  }

  const ticketUrl = ticket.qrCodeUrl;

  const dateStr = format(new Date(ticket.eventDate), "EEE, MMM d, yyyy");
  const timeStr = format(new Date(ticket.eventDate), "h:mm a");

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-24 px-6">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-lg border border-neutral-200 overflow-hidden">
          {/* Ticket header */}
          <div className="bg-primary p-6 text-white text-center">
            <h1 className="text-2xl font-bold">{ticket.eventName}</h1>
            <p className="text-sm mt-1">{ticket.ticketType}</p>
          </div>

          {/* Ticket body */}
          <div className="p-6 space-y-2 w-full">
            <div className="grid grid-cols-2 gap-2 md:gap-y-2 md:gap-x-6 text-sm w-full">
              <div>
                <p className="text-neutral-400 text-xs uppercase tracking-wider">
                  Date
                </p>
                <p className="font-medium text-neutral-800">{dateStr}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-xs uppercase tracking-wider">
                  Time
                </p>
                <p className="font-medium text-neutral-800">{timeStr}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-xs uppercase tracking-wider">
                  Venue
                </p>
                <p className="font-medium text-neutral-800">
                  {ticket.venueName ?? "TBA"}
                </p>
              </div>
              <div>
                <p className="text-neutral-400 text-xs uppercase tracking-wider">
                  Price
                </p>
                <p className="font-bold text-primary">
                  GH₵ {Number(ticket.price).toFixed(2)}
                </p>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center py-2">
              {ticketUrl.startsWith("data:") ? (
                <img src={ticketUrl} alt="QR Code" className="w-40 h-40" />
              ) : (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketUrl)}`}
                  alt="QR Code"
                  className="w-40 h-40"
                />
              )}
            </div>

            <div className="text-center">
              <p className="text-xs text-neutral-400 font-mono">
                {ticket.ticketIdentifier}
              </p>
            </div>

            {/* Status */}
            <div className="text-center">
              {ticket.checkedIn ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-primary rounded-full text-sm font-medium">
                  Checked In
                </span>
              ) : ticket.orderStatus === "Completed" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-green-700 rounded-full text-sm font-medium">
                  Valid Ticket
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                  Payment Pending
                </span>
              )}
            </div>
          </div>

          {/* Purchaser info */}
          <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200">
            <p className="text-xs text-neutral-400 uppercase tracking-wider">
              Purchaser
            </p>
            <p className="text-sm font-medium text-neutral-700">
              {ticket.purchaserFirstName} {ticket.purchaserLastName}
            </p>
            <p className="text-xs text-neutral-500">{ticket.purchaserEmail}</p>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          Present this ticket at the venue for check-in.
        </p>
      </div>
    </div>
  );
}
