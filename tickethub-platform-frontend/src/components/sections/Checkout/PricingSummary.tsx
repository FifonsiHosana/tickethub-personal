import React from "react";
import { assets } from "@/assets/assets";
import { PaymentCTA } from "./PaymentCTA";

interface PricingSummaryProps {
  subtotal: number;
  isProcessing: boolean;
}

export const PricingSummary: React.FC<PricingSummaryProps> = ({
  subtotal,
  isProcessing,
}) => {
  const total = subtotal;

  return (
    <div className="bg-white rounded-4xl p-6 sm:p-8 border border-neutral-100 shadow-xl shadow-neutral-200/40 flex flex-col gap-6 ">
      <h3 className="text-xl font-bold text-foreground">Total Payment</h3>

      <div className="flex flex-col gap-4 text-sm border-b border-neutral-100 pb-6">
        <div className="flex justify-between items-center text-neutral-500">
          <span>Tickets Subtotal</span>
          <span className="font-medium text-foreground">
            GH₵ {subtotal.toFixed(2)}
          </span>
        </div>
        {/* <div className="flex justify-between items-center text-neutral-500">
          <span>Taxes & Fees</span>
          <span className="font-medium text-foreground">
            GH₵ {fees.toFixed(2)}
          </span>
        </div> */}
      </div>

      <div className="flex justify-between items-center">
        <span className="font-bold text-foreground">Total</span>
        <span className="text-3xl font-bold text-[#1a201c]">
          GH₵ {total.toFixed(2)}
        </span>
      </div>

      {/* Money Logos */}
      <div className="flex items-center">
        <img src={assets.MoneyLogos} />
      </div>

      {/* Make Payment CTA */}
      <PaymentCTA isProcessing={isProcessing} />

      {/* Decorative Secure Badge */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-400 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
        <svg
          className="w-4 h-4 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        Secure Encrypted Checkout
      </div>
    </div>
  );
};
