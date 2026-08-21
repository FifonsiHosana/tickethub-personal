import { ArrowLeft, Coins, Minus, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router";
import PayStackPop from "@paystack/inline-js";
import { toast } from "sonner";
import {
  buyCredits,
  getCreditWallet,
  verifyCreditPurchase,
} from "@/utils/services/organizers/sms.service";
import {
  useCreditWallet,
  useBuyCredits,
  useVerifyCreditPurchase,
} from "@/hooks/organizers/useOrganizerSms";

const MIN_CUSTOM_CREDITS = 100;
const MAX_CUSTOM_CREDITS = 50000;
const PRICE_PER_CREDIT = 0.5;

export default function SmsCredits() {
  const [customCredits, setCustomCredits] = useState(1000);
  const navigate = useNavigate();

  const { data: wallet, refetch: refetchWallet } = useCreditWallet();
  const { mutateAsync: buyCreditsMutation, isPending: isPurchasing } =
    useBuyCredits();
  const { mutateAsync: verifyPurchaseMutation } = useVerifyCreditPurchase();

  const customPrice = Number((customCredits * PRICE_PER_CREDIT).toFixed(2));

  const refreshWallet = async (reference?: string) => {
    try {
      if (reference) {
        const walletData = await verifyPurchaseMutation(reference);
        refetchWallet();
        return walletData;
      } else {
        await refetchWallet();
      }
    } catch (error) {
      console.error("Failed to refresh credit wallet:", error);
    }
  };

  const handleAddCredits = async (credits: number, price: number) => {
    try {
      const result = await buyCreditsMutation({
        credits,
        amount: Math.round(price * 100),
        currency: "GHS",
        planName: "sms-credits",
      });

      if (result?.mock) {
        await refreshWallet();
        toast.success("Your credits were added locally for development.");
        return;
      }

      const accessCode = result?.accessCode || result?.access_code;
      const reference = result?.reference;

      if (!accessCode) {
        toast.error("Unable to start the payment popup. Please try again.");
        return;
      }

      const popup = new PayStackPop();

      popup.resumeTransaction(accessCode, {
        onSuccess: async () => {
          try {
            await refreshWallet(reference);
            toast.success("Payment successful! Your credits have been added.");
          } catch {
            toast.success(
              "Payment received. Your balance will update in a moment – please refresh if needed.",
            );
          }
        },

        onCancel: () => {
          toast.info("Payment cancelled. No credits were added.");
        },

        onError: () => {
          toast.error("Payment could not be completed. Please try again.");
        },
      });
    } catch (error) {
      console.error("Failed to start credit purchase:", error);
      toast.error("Unable to start the purchase right now. Please try again.");
    }
  };

  const updateCustomCredits = (value: number) => {
    setCustomCredits(
      Math.min(MAX_CUSTOM_CREDITS, Math.max(MIN_CUSTOM_CREDITS, value)),
    );
  };

  return (
    <div className="m-auto my-5 flex w-full max-w-6xl flex-col gap-8 px-4">
      <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
      </Button>
      {/* <div className="text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Coins className="size-6" />
        </div>
        <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          Top up your SMS credits
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a pack and keep your campaigns running. Credits never expire.
        </p>
      </div> */}

      {wallet && (
        <div className="rounded-2xl border border-border p-6">
          <h3 className="font-medium text-foreground mb-4">Current Balance</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-accent/50 p-4">
              <p className="text-sm text-muted-foreground">Total Credits</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {Number(wallet.totalCredit ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-accent/50 p-4">
              <p className="text-sm text-muted-foreground">Credits Used</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {Number(wallet.creditUsed ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-accent/50 p-4">
              <p className="text-sm text-muted-foreground">Credits Remaining</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {Number(wallet.creditLeft ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="relative overflow-hidden rounded-2xl border border-dashed bg-accent/50 border-border p-6 shadow-sm">
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
              Adjust in steps of 100 credits.
            </p>
          </div>

          <div className="rounded-2xl border border-border  p-5 shadow-sm">
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

            <div className="flex min-w-[150px] items-center justify-center rounded-xl border border-border  px-3 py-2">
              <Input
                type="number"
                min={MIN_CUSTOM_CREDITS}
                max={MAX_CUSTOM_CREDITS}
                step={100}
                inputMode="numeric"
                value={customCredits}
                onChange={(event) =>
                  updateCustomCredits(Number(event.target.value))
                }
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
            <Button
              className="w-30 m-auto cursor-pointer"
              disabled={isPurchasing}
              onClick={() => handleAddCredits(customCredits, customPrice)}
            >
              {isPurchasing ? "Processing..." : "Buy Now"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
