import { useSearchParams, useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paystackRef = searchParams.get("reference");

  useEffect(() => {
    if (!paystackRef) {
      navigate("/", { replace: true });
    }
  }, [paystackRef, navigate]);

  return (
    <section className="py-32 px-6 lg:px-12 max-w-7xl h-full mx-auto flex items-center justify-center text-center">
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

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="rounded-full h-14 px-8 shadow-xl shadow-primary/20 group"
            render={
              <Link to={`/events`}>
                Check out more Events{" "}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            }
          ></Button>
        </div>
      </motion.div>
    </section>
  );
}
