import { format } from "date-fns";
import {
  CalendarIcon,
  EditIcon,
  ExternalLinkIcon,
  MapPinIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OrganizerEventDetail } from "@/utils/services/organizers/events.service";
import { getEventPath } from "@/utils/routes/eventRoutes";
import { statusColor } from "@/utils/statusColors";

interface Props {
  event: OrganizerEventDetail;
}

function eventDate(value: string) {
  return format(new Date(value), "MMM d, yyyy • h:mm a");
}

export function EventDetailHeader({ event }: Props) {
  const navigate = useNavigate();
  const venue = event.venue;
  const venueText = venue
    ? [venue.venue_name, venue.city_or_town, venue.country]
        .filter(Boolean)
        .join(", ")
    : "No venue set";

  return (
    <div className="rounded-xl  bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge className={statusColor[event.status] ?? ""}>
              {event.status}
            </Badge>
            {/* <Badge variant="secondary" className={approvalColor[event.approvalStatus] ?? ""}>
              {event.approvalStatus}
            </Badge> */}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {event.title}
            </h1>
            <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-4">
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4" />{" "}
                {eventDate(event.dateAndTime)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4" /> {venueText}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
          <Button variant="outline" render={<Link to={getEventPath(event)} />}>
            <ExternalLinkIcon className="mr-1 h-4 w-4" /> Public page
          </Button>
          <Button
            onClick={() =>
              navigate(`/organizer/events/${event.slug || event.id}/edit`)
            }
          >
            <EditIcon className="mr-1 h-4 w-4" /> Edit event
          </Button>
        </div>
      </div>
    </div>
  );
}
