import React from "react";

interface PaymentCTAProps {
  isProcessing?: boolean;
}

export const PaymentCTA: React.FC<PaymentCTAProps> = ({
  isProcessing = false,
}) => {
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
