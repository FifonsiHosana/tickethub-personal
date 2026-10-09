import React from "react";
import { CheckoutForm } from "@/components/sections/Checkout/CheckoutForm";
// import { OrderSummary } from "@/components/sections/Checkout/OrderSummary";
import { PricingSummary } from "@/components/sections/Checkout/PricingSummary";
import { useTicketCartStore } from "@/stores/tickets.store";
import { useInitiateCheckoutV2 } from "@/hooks/attendees/tickets/useCheckoutV2";
import { useCheckout } from "@/hooks/useCheckout";
import { useProcessingFeePercentage } from "@/hooks/useSettings";
import { computeTotalWithFee } from "@/utils/checkout/checkout.utils";
import { Loader } from "@/components/ui/loader";
import { MoveLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router";

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { totalTicketAmount, totalTicketQuantity } = useTicketCartStore();
  const checkoutMutation = useInitiateCheckoutV2();
  const processingFeePercentage = useProcessingFeePercentage();
  const { feeAmount } = computeTotalWithFee(
    totalTicketAmount,
    processingFeePercentage,
  );
  const totalFeeAmount = (feeAmount * totalTicketQuantity) as number;

  const { handleTicketOrderPurchase } = useCheckout({
    initiateCheckout: checkoutMutation.mutateAsync,
  });

  if (checkoutMutation.isPending)
    return <Loader loading={true} fullScreen={true} />;

  return (
    <main className="w-full min-h-screen bg-neutral-50/50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex justify-between">
          <div className="mb-10">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-2">
              Secure Checkout
            </h1>
            <p className="text-neutral-500 font-sans">
              Complete your details to secure your tickets.
            </p>
          </div>
          <div className="">
            <div
              onClick={() => {
                navigate(-1);
                // clearCart();
              }}
              className="inline-flex justify-center items-top gap-2 rounded-full px-4 p-2 bg-muted hover:bg-muted/80 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            >
              <MoveLeft />
              {isMobile ? `` : ` Go Back`}
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Form, Order Summary, CTA */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
            <div className="bg-white  pb-10 p-6 sm:p-8  flex flex-col gap-10">
              {/* Buyer Information Form */}
              <section>
                <h3 className="text-xl font-bold text-foreground mb-6">
                  Contact Information
                </h3>
                <CheckoutForm onSubmit={handleTicketOrderPurchase} />
              </section>

              {/* Order Summary List */}
              {/* <section className="pt-8 border-t border-neutral-100">
                <OrderSummary items={items} />
              </section> */}
            </div>
          </div>

          {/* Right Column: Sticky Pricing Summary */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24 h-fit">
            <PricingSummary
              subtotal={totalTicketAmount}
              feeAmount={totalFeeAmount}
              isProcessing={
                checkoutMutation.isPending
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
};
