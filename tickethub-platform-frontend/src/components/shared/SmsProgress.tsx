import { ArrowUpCircle } from "lucide-react";
import { Progress } from "../ui/progress";
import { useLocation, useNavigate } from "react-router";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { useEffect } from "react";
import { getCreditWallet } from "@/utils/services/organizers/sms.service";
import { syncCreditsFromWallet, useCredits } from "@/stores/credit-store";

const SmsProgress = () => {
  const navigate = useNavigate();
  const { activeRole: role } = useAuthStorage();

  const { total, used } = useCredits();

  //   const role = useAuthStorage().getRole();
  const loadCredits = async () => {
    try {
      const wallet = await getCreditWallet();
      syncCreditsFromWallet(wallet);
    } catch (error) {
      console.error("Failed to load SMS credit wallet:", error);
    }
  };

  // console.log("User role:", role);

  useEffect(() => {
    loadCredits();
  }, []);

  // Reload whenever the user navigates poor this one
  useEffect(() => {
    loadCredits();
  }, [location.pathname]);

  const TOTAL_CREDITS = total;
  const usedCredits = used;
  const leftCredits = Math.max(0, TOTAL_CREDITS - usedCredits);
  const leftPct = TOTAL_CREDITS > 0 ? (leftCredits / TOTAL_CREDITS) * 100 : 0;

  const { pathname } = useLocation();
  const isSmsPage = pathname.toLowerCase().includes("sms");
  if (!isSmsPage) {
    return;
  }
  return (
    <div className="flex flex-col">
      {role === "organizer" ? (
        <>
          <div className="flex flex-row items-center gap-2">
            <span className="text-sm">
              <span className="font-semibold text-foreground tabular-nums">
                {usedCredits.toLocaleString()}
              </span>{" "}
              credits used
              <span className="mx-1 text-muted-foreground">·</span>
              <span className="font-semibold text-primary tabular-nums">
                {leftCredits.toLocaleString()}
              </span>{" "}
              left
            </span>
            <span
              className="cursor-pointer rounded border border-neutral-300 bg-primary/10 px-1 py-1"
              onClick={() => navigate("/organizer/sms/credits")}
              aria-label="Top up credits"
            >
              <ArrowUpCircle size={20} className="text-primary" />
            </span>
          </div>
          <Progress
            value={leftPct}
            className="mt-1 w-full max-w-sm rounded border border-neutral-300"
          />
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default SmsProgress;
