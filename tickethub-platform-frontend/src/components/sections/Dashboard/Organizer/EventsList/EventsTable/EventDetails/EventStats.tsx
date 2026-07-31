import { format } from "date-fns";
import { Calendar, Users } from "lucide-react";

interface EventStatsProps {
  dateAndTime: string;
  capacity: number;
}

export function EventStats({ dateAndTime, capacity }: EventStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1.5 p-3 rounded-lg border bg-card">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">
            Date
          </span>
        </div>
        <p className="text-sm font-medium">
          {format(new Date(dateAndTime), "MMM d, yyyy")}
          <br />
          <span className="text-muted-foreground font-normal">
            {format(new Date(dateAndTime), "h:mm a")}
          </span>
        </p>
      </div>

      <div className="space-y-1.5 p-3 rounded-lg border bg-card">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">
            Capacity
          </span>
        </div>
        <p className="text-lg font-semibold mt-1">
          {capacity?.toLocaleString() || 0}
        </p>
      </div>
    </div>
  );
}