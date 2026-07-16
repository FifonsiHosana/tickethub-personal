import React from "react";
import {
  useTicketCartStore,
  type SelectedTicket,
} from "@/stores/tickets.store";
import { Trash } from "lucide-react";
interface OrderSummaryProps {
  items: SelectedTicket[];
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ items }) => {
  const { removeTicket, totalAmount, totalQuantity } = useTicketCartStore();
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold text-foreground mb-2">Order Summary</h3>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">Your cart is empty.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.eventTicketId}
              className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-neutral-50/50 border border-neutral-100 rounded-2xl"
            >
              {/* Small Event Banner */}
              <img
                src={item.banner}
                alt={item.eventName}
                className="w-24 h-24 rounded-xl object-cover shadow-sm"
              />

              {/* Details */}
              <div className="flex flex-col grow">
                <h4 className="font-semibold text-foreground text-sm">
                  {item.eventName}
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {item.ticketType}
                </p>
              </div>

              {/* Pricing & Qty and Remove Button */}
              <div className="flex flex-col md:items-end gap-2 md:text-right">
                <span className="font-bold text-foreground text-sm">
                  GH₵ {(item.price * item.quantity).toFixed(2)}
                </span>
                <span className="text-xs text-neutral-400 mt-0.5">
                  Qty: {item.quantity}
                </span>

                {/* Remove Button */}
                <button
                  type="button"
                  className="text-neutral-400 hover:text-red-500 transition-colors mt-1"
                  onClick={() => {
                    removeTicket(item.eventTicketId);
                    totalAmount();
                    totalQuantity();
                  }}
                  title="Remove ticket"
                >
                  <Trash size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
