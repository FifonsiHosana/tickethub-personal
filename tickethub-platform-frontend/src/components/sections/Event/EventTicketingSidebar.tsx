import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEventTickets } from "@/hooks/attendees/events/useEvent";
import { Loader } from "@/components/ui/loader";
import { type EventTicket } from "@/types/ticket.types";
import { useNavigate } from "react-router";
import { Minus, Plus } from "lucide-react";
import { useTicketCartStore } from "@/stores/tickets.store";

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
  const { data: tickets, isLoading, isError } = useEventTickets();

  const {
    items,
    addTicket,
    increaseQuantity,
    decreaseQuantity,
    totalAmount,
    totalQuantity,
    totalTicketQuantity,
    totalTicketAmount,
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

  if (isError || !tickets || tickets.length === 0) {
    return (
      <div className="sticky top-32 p-8 rounded-3xl border border-neutral-100 shadow-xl bg-white text-center">
        <p className="text-red-500 animate-pulse font-sans text-sm">
          Tickets are currently unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="sticky top-32 p-3 md:p-4 rounded-3xl border border-neutral-200 shadow-xl shadow-neutral-200/50 flex flex-col gap-4 bg-white">
      {/* Sidebar Header */}

      {/* Ticket List */}
      <div className="flex flex-col gap-4">
        {tickets.map((ticket: EventTicket) => {
          const cartItem = items.find(
            (item) => item.eventTicketId === ticket.eventTicketId,
          );

          const qty = cartItem ? cartItem.quantity : 0;
          const isSelected = qty > 0;
          const isSoldOut = ticket.totalRemaining === 0;

          return (
            <div
              key={ticket.eventTicketId}
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                isSelected
                  ? "border-foreground bg-foreground/5"
                  : "border-neutral-200 bg-white"
              } ${isSoldOut ? "opacity-50" : ""}`}
            >

              {/*  */}
              <div className="flex flex-col w-full">
                <div className="flex flex-row items-center justify-between">
                  <h4 className="font-sans font-semibold text-foreground text-lg">
                    {ticket.ticketName}
                  </h4>
                  <p className="text-sm text-neutral-800">
                    {Number(ticket.price) === 0
                      ? "Free"
                      : `GH₵ ${Number(ticket.price).toFixed(2)}`}
                  </p>
                </div>

                {ticket.description && (
                  <p className="text-xs text-neutral-600 mt-1">
                    {ticket.description}
                  </p>
                )}
              </div>
              {/* Quantity Controls */}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-medium text-neutral-600">
                  {isSoldOut
                    ? "Sold Out"
                    : `${ticket.totalRemaining} available`}
                </span>

                {!isSoldOut && status === "Published" && (
                  <div className="flex items-center gap-3">
                    {/* Minus Button */}
                    <button
                      onClick={() => {
                        decreaseQuantity(ticket.eventTicketId);
                        totalAmount();
                        totalQuantity();
                      }}
                      disabled={qty === 0}
                      className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="w-4 text-center font-semibold text-foreground">
                      {qty}
                    </span>

                    {/* Plus Button */}
                    <button
                      onClick={() => {
                        if (qty === 0) {
                          // First time adding to cart
                          addTicket({
                            eventTicketId: ticket.eventTicketId,
                            ticketName: ticket.ticketName,
                            ticketType: ticket.ticketType || "Standard", // Fallback if missing
                            price: Number(ticket.price),
                            eventName: eventName,
                            banner: banner,
                          });
                          totalAmount();
                          totalQuantity();
                        } else {
                          // Already in cart, just increase
                          increaseQuantity(ticket.eventTicketId);
                          totalAmount();
                          totalQuantity();
                        }
                      }}
                      disabled={qty >= ticket.totalRemaining}
                      className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Checkout Button Area */}
      <div className="min-h-25 flex flex-col justify-end">
        <AnimatePresence mode="wait">
          {items.length > 0 ? (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
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
                {totalTicketQuantity === 1 ? "ticket" : "tickets"})
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
                {status === "Published"
                  ? "Select tickets to continue"
                  : "Event Unavailable"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-xs text-center text-neutral-400 font-sans mt-4">
          Secure checkout powered by TicketHub
        </p>
      </div>
    </div>
  );
};
