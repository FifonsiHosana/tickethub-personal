import { useSearchParams, useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  getSessionItem,
  GUEST_CHECKOUT_EMAIL_KEY,
} from "@/utils/storage/sessionStorage";
import { ArrowRight, Loader2Icon, Ticket } from "lucide-react";
import { useOrdersFromReference } from "@/hooks/attendees/orders/useOrdersFromReference";

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // const { token } = useAuthStorage();

  const paystackRef = searchParams.get("reference");
  const guestEmail = getSessionItem(GUEST_CHECKOUT_EMAIL_KEY) ?? undefined;

  useEffect(() => {
    if (!paystackRef) {
      navigate("/", { replace: true });
    }
  }, [paystackRef, navigate]);

  const { data: orders } = useOrdersFromReference({
    reference: paystackRef as string,
    email: guestEmail,
  });


  // const ticketsTarget = token ? "/ticket-order-history" : "/login";
  // : `/account/setup-password?email=${encodeURIComponent(guestEmail ?? "")}`;

  return (
    <section className="py-24 px-6 lg:px-12 max-w-7xl h-full mx-auto flex items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full text-center space-y-10"
      >
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl">Payment Confirmed!</h1>
          <p className="text-muted-foreground font-sans text-lg max-w-sm mx-auto">
            Your Payment is successful. Kindly check your email for a
            confirmation and inclusion of digital tickets
          </p>
        </div>

        {/* Receipt Box */}
        <div className="bg-background p-6 rounded-2xl border-2 border-dashed flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">
            Reference Number
          </span>
          <span className="text-sm break-all">{paystackRef}</span>
        </div>

        <div className="flex flex-col sm:flex-col gap-4 justify-center">
          <div className="flex flex-col sm:flex-col gap-4 justify-center">
            <div className="w-full rounded-2xl border overflow-hidden">
              {!orders ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <p className="text-primary">
                    Fetching tickets. Please wait...
                  </p>
                  <Loader2Icon className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                orders.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 border-b last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {ticket.ticketTypeName || `Ticket type ${orders.tickets.indexOf(ticket) + 1}`}
                      </p>
                    </div>

                    <Button
                      
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-full border-primary bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90 hover:text-white"
                    >
                      <Link
                        to={ticket.qrCodeUrl}
                        className="flex items-center gap-2"
                      >
                        <Ticket className="h-4 w-4" />
                        <span>View Ticket</span>
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <Button
            size="lg"
            variant="outline"
            className="rounded-full h-14 px-8 group"
            render={
              <Link to={`/events`}>
                Check Out More Events
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            }
          ></Button>
        </div>
      </motion.div>
    </section>
  );
}

