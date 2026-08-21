import { ArrowLeft, Coins, Minus, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SuccessModal } from "@/components/ui/success-modal";
// import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router";
import PayStackPop from "@paystack/inline-js";
import { syncCreditsFromWallet } from "@/stores/creditStore";
import {
  buyCredits,
  getCreditWallet,
  verifyCreditPurchase,
} from "@/utils/services/organizers/sms.service";

// type Plan = {
//   id: string;
//   name: string;
//   credits: number;
//   price: number;
//   popular?: boolean;
//   features: string[];
// };

// const plans: Plan[] = [
//   {
//     id: "starter",
//     name: "Starter",
//     credits: 5000,
//     price: 25,
//     features: ["5,000 SMS credits", "Send to ticket owners", "Email support", "Basic analytics"],
//   },
//   {
//     id: "growth",
//     name: "Growth",
//     credits: 25000,
//     price: 100,
//     popular: true,
//     features: [
//       "25,000 SMS credits",
//       "Send to ticket owners & other numbers",
//       "Priority support",
//       "Advanced analytics",
//     ],
//   },
//   {
//     id: "scale",
//     name: "Scale",
//     credits: 100000,
//     price: 350,
//     features: [
//       "100,000 SMS credits",
//       "Send to ticket owners & other numbers",
//       "Dedicated manager",
//     ],
//   },
// ];

const MIN_CUSTOM_CREDITS = 100;
const MAX_CUSTOM_CREDITS = 50000;
const PRICE_PER_CREDIT = 0.5;

export default function SmsCredits() {
  const [customCredits, setCustomCredits] = useState(1000);
  const [showModal, setShowModal]         = useState(false);
  const [modalMessage, setModalMessage]   = useState("");
  const [isPurchasing, setIsPurchasing]   = useState(false);
  const navigate = useNavigate();

  const customPrice = Number((customCredits * PRICE_PER_CREDIT).toFixed(2));

  const refreshWallet = async (reference?: string) => {
    try {
      if (reference) {
        const wallet = await verifyCreditPurchase(reference);
        syncCreditsFromWallet(wallet);
      } else {
        const wallet = await getCreditWallet();
        syncCreditsFromWallet(wallet);
      }
    } catch (error) {
      console.error("Failed to refresh credit wallet:", error);
      // last-last: fallback: plain balance fetch
      try {
        const wallet = await getCreditWallet();
        syncCreditsFromWallet(wallet);
      } catch (_) { /* silent */ }
    }
  };

  const handleAddCredits = async (credits: number, price: number) => {
    try {
      setIsPurchasing(true);

      const result = await buyCredits({
        credits,
        amount: Math.round(price * 100), // convert to pesewas
        currency: "GHS",
        planName: "sms-credits",
      });

      // For my sake
      if (result?.mock) {
        await refreshWallet();
        setModalMessage("Your credits were added locally for development.");
        setShowModal(true);
        setIsPurchasing(false);
        return;
      }

      const accessCode = result?.accessCode || result?.access_code;
      const reference  = result?.reference;

      if (!accessCode) {
        setModalMessage("Unable to start the payment popup. Please try again.");
        setShowModal(true);
        setIsPurchasing(false);
        return;
      }

      //  Real Paystack popup 
      const popup = new PayStackPop();

      popup.resumeTransaction(accessCode, {
        onSuccess: async (_transaction: unknown) => {
          try {
            await refreshWallet(reference);
            setModalMessage("Payment successful! Your credits have been added.");
          } catch {
            // verify endpoint failed – show a softer message; webhook will still run
            setModalMessage(
              "Payment received. Your balance will update in a moment – please refresh if needed.",
            );
          } finally {
            setShowModal(true);
            setIsPurchasing(false);
          }
        },

        onCancel: () => {
          setModalMessage("Payment cancelled. No credits were added.");
          setShowModal(true);
          setIsPurchasing(false);
        },

        onError: () => {
          setModalMessage("Payment could not be completed. Please try again.");
          setShowModal(true);
          setIsPurchasing(false);
        },
      });
    } catch (error) {
      console.error("Failed to start credit purchase:", error);
      setModalMessage("Unable to start the purchase right now. Please try again.");
      setShowModal(true);
      setIsPurchasing(false);
    }
  };

  const updateCustomCredits = (value: number) => {
    setCustomCredits(Math.min(MAX_CUSTOM_CREDITS, Math.max(MIN_CUSTOM_CREDITS, value)));
  };

  return (
    // <DashboardLayout title="SMS Credits">
    <div className="m-auto my-5 flex w-full max-w-6xl flex-col gap-8 px-4">
      <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
      </Button>
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Coins className="size-6" />
        </div>
        <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          Top up your SMS credits
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a pack and keep your campaigns running. Credits never expire.
        </p>
      </div>

      {/* <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-white p-6",
              plan.popular ? "border-primary shadow-md" : "border-border"
            )}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Most popular
              </span>
            )}
            <div className="flex items-center gap-2">
              <Sparkles
                className={cn(
                  "size-4",
                  plan.popular ? "text-primary" : "text-muted-foreground"
                )}
              />
              <h3 className="font-medium text-foreground">{plan.name}</h3>
            </div>

            <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground tabular-nums">
              Gh₵{plan.price}
            </p>
            <p className="text-sm text-muted-foreground">
              {plan.credits.toLocaleString()} credits
            </p>

            <ul className="mt-5 flex-1 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="size-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              className={cn(
                "mt-6 w-full rounded-xl",
                !plan.popular && "bg-foreground text-background hover:bg-foreground/90"
              )}
              disabled={isPurchasing}
              onClick={() => handleAddCredits(plan.credits, plan.price)}
            >
              {isPurchasing ? "Processing..." : `Buy ${plan.credits.toLocaleString()} credits`}
            </Button>
          </div>
        ))}
      </div> */}

      <div className="relative overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-orange-50 p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Settings className="size-4" />
              Custom plan
            </div>
            <h3 className="mt-2 text-xl font-semibold text-foreground">
              Build your own credit pack
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Pick the exact number of credits you need and adjust the total instantly.
            </p>
          </div>

          <div className="rounded-2xl border bg-white/80 p-5 shadow-sm">
            <div className="text-sm text-muted-foreground">Estimated total</div>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground tabular-nums">
              Gh₵{customPrice}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {customCredits.toLocaleString()} credits
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border/70 bg-background/80 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="size-10 rounded-full cursor-pointer"
              onClick={() => updateCustomCredits(customCredits - 100)}
            >
              <Minus className="size-4" />
            </Button>

            <div className="flex min-w-[150px] items-center justify-center rounded-xl border border-border bg-white px-3 py-2">
              <input
                type="number"
                min={MIN_CUSTOM_CREDITS}
                max={MAX_CUSTOM_CREDITS}
                step={100}
                inputMode="numeric"
                value={customCredits}
                onChange={(event) => updateCustomCredits(Number(event.target.value))}
                className="w-full bg-transparent text-center text-lg font-semibold text-foreground outline-none"
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              className="size-10 rounded-full cursor-pointer"
              onClick={() => updateCustomCredits(customCredits + 100)}
            >
              <Plus className="size-4" />
            </Button>
          </div>

          <div className="text-sm flex flex-col text-muted-foreground">
            Adjust in steps of 100 credits
            <Button
              className={'w-30 m-auto cursor-pointer'}
              disabled={isPurchasing}
              onClick={() => handleAddCredits(customCredits, customPrice)}
            >
              {isPurchasing ? "Processing..." : "Buy Now"}
            </Button>
          </div>
        </div>
      </div>

      <SuccessModal
        show={showModal}
        onClose={() => setShowModal(false)}
        message={modalMessage}
      />
    </div>
    // </DashboardLayout>
  );
}
