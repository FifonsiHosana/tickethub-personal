import { InboxIcon } from "lucide-react";

export default function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <InboxIcon className="h-12 w-12 text-muted-foreground mb-3" />
      <p className="font-medium text-foreground">No orders yet</p>
      <p className="text-sm text-muted-foreground mt-1">
        Orders you make will appear here once you purchase tickets.
      </p>
    </div>
  );
}