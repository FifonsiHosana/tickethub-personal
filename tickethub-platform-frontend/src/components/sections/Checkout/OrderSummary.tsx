import React from "react";
import {
  useTicketCartStore,
  type SelectedTicket,
} from "@/stores/tickets.store";
import { Trash } from "lucide-react";
import { useNavigate } from "react-router";
interface OrderSummaryProps {
  items: SelectedTicket[];
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ items }) => {
  const { removeTicket } = useTicketCartStore();
  const navigate = useNavigate();
  return (
    <div className="space-y-3 mb-6 pb-6 border-b border-stone-200">
      {/* <h3 className="text-lg font-bold text-foreground mb-2">Order Summary</h3> */}
      <div className="font-semibold text-stone-900 mb-3">Tickets</div>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">Your cart is empty.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.eventTicketId}
              className="flex  md:flex-row md:items-center gap-2 p-0"
            >
              {/* Details */}
              <div className="flex flex-col grow">
                <p className="text-xs">{item.eventName}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {item.ticketType} x {item.quantity}
                </p>
              </div>

              {/* Pricing & Qty and Remove Button */}
              <div className="flex flex-col md:items-end gap-2 md:text-right">
                <span className="font-bold text-foreground text-sm">
                  GH₵ {(item.price * item.quantity).toFixed(2)}
                </span>
                <span className="text-xs text-neutral-400 mt-0.5">
                  <Trash
                    onClick={() => {
                      removeTicket(item.eventTicketId);
                      items.length === 1 && navigate(-1);
                    }}
                    className="text-destructive cursor-pointer h-3 w-3"
                  />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
