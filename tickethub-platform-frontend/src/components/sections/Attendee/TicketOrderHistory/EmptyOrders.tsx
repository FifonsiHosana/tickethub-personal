import { Link } from "react-router";
import { InboxIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmptyOrders() {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <InboxIcon className="mb-3 h-12 w-12 text-muted-foreground" />
      <p className="font-medium text-foreground">No orders yet</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Tickets you buy will appear here after checkout is completed.
      </p>
      <Button className="mt-5" render={<Link to="/events">Browse events</Link>} />
    </div>
  );
}
