import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEventTickets } from "@/hooks/attendees/events/useEvent";
import { Loader } from "@/components/ui/loader";
import { type EventTicket } from "@/types/ticket.types";
import { useNavigate } from "react-router";
import { Minus, Plus } from "lucide-react";
import { useTicketCartStore } from "@/stores/tickets.store";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";

interface EventTicketingSidebarProps {
  status: "Draft" | "Published" | "Completed" | "Cancelled";
  // capacity: number;
  banner: string;
  eventName: string;
}

export const EventTicketingSidebar: React.FC<EventTicketingSidebarProps> = ({
  status,
  // capacity,
  banner,
  eventName,
}) => {
  const { isMobile } = useIsMobile();

  const { data: tickets, isLoading, isError } = useEventTickets();

  const {
    items,
    addTicket,
    increaseQuantity,
    decreaseQuantity,
    totalTicketAmount,
    totalTicketQuantity,
  } = useTicketCartStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (isLoading) {
    return (
      <div className="sticky top-32 p-8 rounded-3xl border border-neutral-100 shadow-xl bg-white min-h-100 flex items-center justify-center">
        <Loader loading={true} />
      </div>
    );
  }

  if (isError || !tickets) {
    return (
      <div className="sticky top-32 p-8 rounded-3xl border border-neutral-100 shadow-xl bg-white text-center">
        <p className="text-red-500 animate-pulse font-sans text-sm">
          Tickets are currently unavailable.
        </p>
      </div>
    );
  }

  const lastTicket = tickets[tickets.length - 1];
  const allTicketsSoldOut = tickets.every(
    (ticket) => ticket.totalRemaining === 0,
  );

  return (
    <Card className=" sticky top-32 rounded-2xl flex flex-col  p-4">
      {/* Sidebar Header */}

      <div className=" font-semibold text-2xl">Available Tickets</div>

      {/* Ticket List */}
      <div className="flex flex-col gap-4">
        {tickets.map((ticket: EventTicket) => {
          const cartItem = items.find(
            (item) => item.eventTicketId === ticket.eventTicketId,
          );

          const qty = cartItem ? cartItem.quantity : 0;
          const isSelected = qty > 0;
          const isSoldOut = ticket.totalRemaining === 0 && !isSelected;

          return (
            <div key={ticket.eventTicketId}>
              <div
                className={`p-4 transition-colors duration-300 ${
                  isSelected ? "bg-foreground/5" : "bg-white"
                } ${isSoldOut ? "opacity-50" : ""}`}
              >
                <div
                  className={`flex flex-col w-full ${isSoldOut ? "flex-row justify-between" : ""}`}
                >
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <h4 className="font-sans font-semibold text-foreground text-lg">
                        {ticket.ticketName}
                      </h4>
                      {ticket.description && (
                        <p className="text-xs text-neutral-600 mt-1">
                          {ticket.description}
                        </p>
                      )}
                    </div>
                    {!isSoldOut && (
                      <p className="text-sm text-neutral-800">
                        {Number(ticket.price) === 0
                          ? "Free"
                          : `GH₵ ${Number(ticket.price).toFixed(2)}`}
                      </p>
                    )}
                  </div>

                  {/* {ticket.description && (
                    <p className="text-xs text-neutral-600 mt-1">
                      {ticket.description}
                    </p>
                  )} */}
                  <span className="text-lg text-red-500 font-bold">
                    {
                      isSoldOut && "Sold Out"

                      ///////Tickets remaining could live here
                    }
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-end mt-2">
                  {!isSoldOut && status === "Published" && (
                    <div className="flex items-center gap-3">
                      {/* Minus Button */}
                      <button
                        onClick={() => {
                          decreaseQuantity(ticket.eventTicketId);
                          // totalTicketAmount;
                        }}
                        disabled={qty === 0}
                        className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-6 text-center font-semibold text-foreground">
                        {qty}
                        {/* {isSoldOut ? "Sold Out" : `${qty}`} */}
                      </span>

                      {/* Plus Button */}
                      <button
                        onClick={() => {
                          if (qty === 0) {
                            addTicket({
                              eventTicketId: ticket.eventTicketId,
                              ticketName: ticket.ticketName,
                              ticketType: ticket.ticketType || "Standard",
                              price: Number(ticket.price),
                              eventName: eventName,
                              banner: banner,
                            });
                          } else {
                            increaseQuantity(ticket.eventTicketId);
                          }
                          // totalAmount();
                          // totalQuantity();
                        }}
                        disabled={qty >= ticket.totalRemaining || isSoldOut}
                        className="w-8 h-8 bg-primary text-white cursor-pointer rounded-full border border-neutral-300 flex items-center justify-center disabled:opacity-30"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Horizontal Separator - rendered for all items except the last ticket */}
              {lastTicket.ticketId !== ticket.ticketId && (
                <hr className="border-t border-neutral-200 my-0 pt-2" />
              )}
            </div>
          );
        })}
      </div>

      {/* Dynamic Checkout Button Area */}
      {!isMobile && (
        <div className="min-h-25 flex flex-col ">
          <AnimatePresence mode="wait">
            {items.length > 0 ? (
              <motion.div
                key="checkout"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex flex-col gap-4"
              >
                <div className="flex items-center justify-between pt-4">
                  <span className="font-sans text-neutral-500">Total</span>
                  <span className="text-2xl font-bold text-foreground">
                    GH₵ {totalTicketAmount}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 px-6 rounded-full bg-primary text-white font-medium shadow-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Checkout ({totalTicketQuantity}{" "}
                  {totalTicketQuantity === 1 ? "Ticket" : "Tickets"})
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button
                  disabled
                  className="w-full py-4 px-6 rounded-full bg-neutral-100 text-neutral-400 font-medium cursor-not-allowed"
                >
                  {allTicketsSoldOut
                    ? "Sold Out"
                    : status === "Published"
                      ? "Select tickets to continue"
                      : "Event Unavailable"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
};
