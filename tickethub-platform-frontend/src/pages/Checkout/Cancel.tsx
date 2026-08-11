import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, XCircle } from "lucide-react";
import { Link } from "react-router";

export default function CancelPage() {
  return (
    <div className="py-16 md:py-24 px-6 lg:px-12 max-w-7xl mx-auto h-screen flex items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md space-y-8"
      >
        <div className="flex justify-center">
          <div className="p-3 rounded-full">
            <XCircle className="w-16 h-16 text-destructive" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl">Payment Cancelled</h1>
          <p className="text-muted-foreground font-sans">
            No worries! If you had trouble with your payment method, feel free
            to try again or contact us.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            render={
              <Link title="Return to events" to={`/events`}>
                <ArrowLeft className="mr-2 w-4 h-4" /> Return to Events
              </Link>
            }
            size="lg"
            className="rounded-full h-14 border-2"
          ></Button>
          <Button
            render={
              <Link title="Back to Home" to="/">
                Back to Home
              </Link>
            }
            variant="link"
            className="text-muted-foreground"
          ></Button>
        </div>
      </motion.div>
    </div>
  );
}
