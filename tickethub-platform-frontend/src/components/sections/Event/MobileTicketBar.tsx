import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTicketCartStore } from "@/stores/tickets.store";
import { useNavigate } from "react-router";

interface MobileTicketBarProps {
  title: string;
  hidden: boolean;
  onGetTickets: () => void;
}

export const MobileTicketBar: React.FC<MobileTicketBarProps> = ({
  title,
  hidden,
  onGetTickets,
}) => {
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate("/checkout");
  };
  const { items, totalTicketQuantity, totalTicketAmount } =
    useTicketCartStore();

  const itemsInCart = items.length > 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="checkout"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="flex flex-col gap-4"
      >
        <div
          className={`rounded-t-2xl ${itemsInCart ? `bg-[#212529]` : `bg-white`} lg:hidden fixed bottom-0 left-0 right-0 z-500  shadow-2xl transition-transform duration-300 ease-in-out ${
            !itemsInCart && (hidden ? "translate-y-full" : "translate-y-0")
          }`}
        >
          {itemsInCart ? (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-col gap-4 p-2 text-white"
            >
              <div className="flex  flex-col justify-start px-4 pt-4">
                <span className=" font-bold ">
                  {totalTicketQuantity}{" "}
                  {totalTicketQuantity === 1 ? "ticket" : "tickets"}
                </span>
                <span className="font-sans">
                  Total - GH₵ {totalTicketAmount}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full py-2 px-4 rounded-full bg-primary text-white font-medium shadow-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Checkout
              </button>
            </motion.div>
          ) : (
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900 text-sm truncate">
                    {title}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onGetTickets}
                  className="shrink-0 bg-[#fd7d43] text-white font-semibold py-3 px-6 rounded-4xl transition-transform active:scale-95"
                >
                  Get Tickets
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
