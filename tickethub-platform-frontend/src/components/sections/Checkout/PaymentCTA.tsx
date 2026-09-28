import { useIsMobile } from "@/hooks/use-mobile";
import React from "react";

interface PaymentCTAProps {
  isProcessing?: boolean;
  total: number;
}

export const PaymentCTA: React.FC<PaymentCTAProps> = ({
  isProcessing = false,
  total,
}) => {
  const { isMobile } = useIsMobile();
  if (isMobile)
    return (
      <>
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t-2 border-stone-200 shadow-lg z-40">
          {" "}
          <div className="container mx-auto px-6 py-4 ">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-stone-500">Total</p>
                  <p className="text-xl font-bold">₵{total}</p>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isProcessing}
                  className="shrink-0 bg-[#fd7d43] text-white font-semibold py-3 px-6 rounded-4xl transition-transform active:scale-95"
                >
                  {isProcessing ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    <span>Pay Now</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  return (
    <div className="mt-2 border-t border-neutral-100">
      {/* type="submit" and form="checkout-form" links this button to the form above without being nested inside it */}
      <button
        type="submit"
        form="checkout-form"
        disabled={isProcessing}
        className="w-full py-4 px-6 rounded-full bg-primary/80 text-white font-medium shadow-xl hover:bg-primary/50 flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <span className="animate-pulse">Processing...</span>
        ) : (
          <>
            Make Payment
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </>
        )}
      </button>
      <p className="text-xs text-center text-neutral-400 mt-4">
        By continuing, you agree to TicketHub's Terms of Service.
      </p>
    </div>
  );
};
