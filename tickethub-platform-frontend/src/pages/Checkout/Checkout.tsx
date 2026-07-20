import React from "react";
import { CheckoutForm } from "@/components/sections/Checkout/CheckoutForm";
import { OrderSummary } from "@/components/sections/Checkout/OrderSummary";
import { PricingSummary } from "@/components/sections/Checkout/PricingSummary";
import { useTicketCartStore } from "@/stores/tickets.store";
import { usePurchaseTickets } from "@/hooks/attendees/tickets/useTickets";
import { usePayTicket } from "@/hooks/attendees/tickets/usePayTickets";
import { useCheckout } from "@/hooks/useCheckout";
import { Loader } from "@/components/ui/loader";

export const Checkout: React.FC = () => {
  const { items, totalTicketAmount: subtotal } = useTicketCartStore();
  const purchaseMutation = usePurchaseTickets();
  const initiatePaymentFunction = usePayTicket();

  const { handleTicketOrderPurchase } = useCheckout({
    createTicketPurchaseOrder: purchaseMutation.mutateAsync,
    initiatePaymentForPurchaseOrder: initiatePaymentFunction.mutateAsync,
  });

  if (purchaseMutation.isPending || initiatePaymentFunction.isPending)
    return <Loader loading={true} fullScreen={true} />;

  return (
    <main className="w-full min-h-screen bg-neutral-50/50 pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-2">
            Secure Checkout
          </h1>
          <p className="text-neutral-500 font-sans">
            Complete your details to secure your tickets.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Form, Order Summary, CTA */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
            <div className="bg-white rounded-4xl p-6 sm:p-8 border border-neutral-100 shadow-sm flex flex-col gap-10">
              {/* Buyer Information Form */}
              <section>
                <h3 className="text-xl font-bold text-foreground mb-6">
                  Contact Information
                </h3>
                <CheckoutForm onSubmit={handleTicketOrderPurchase} />
              </section>

              {/* Order Summary List */}
              <section className="pt-8 border-t border-neutral-100">
                <OrderSummary items={items} />
              </section>
            </div>
          </div>

          {/* Right Column: Sticky Pricing Summary */}
          <div className="lg:col-span-5 xl:col-span-4 relative ">
            <PricingSummary
              subtotal={subtotal}
              isProcessing={
                purchaseMutation.isPending || initiatePaymentFunction.isPending
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
};
