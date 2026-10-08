import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useOrganizerEvent } from "@/hooks/organizers/useOrganizerEvents";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventAttendeesTab } from "./EventAttendeesTab";
import { EventDetailHeader } from "./EventDetailHeader";
import { EventOverviewTab } from "./EventOverviewTab";
import { EventTransactionsTab } from "./EventTransactionsTab";

interface Props {
  eventIdentifier: string | number;
}

export function OrganizerEventDetailPage({ eventIdentifier }: Props) {
  const navigate = useNavigate();
  const { data: event, isLoading, isError } = useOrganizerEvent(eventIdentifier);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Event not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/organizer/events")}>Back to events</Button>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6 p-1 pb-10">
      <EventDetailHeader event={event} />
      <Tabs defaultValue="overview" className="min-w-0 space-y-4">
        <div className="w-full overflow-x-auto pb-1">
          <TabsList className="min-w-max justify-start sm:w-fit">
            <TabsTrigger value="overview" className="min-w-28 px-3">Overview</TabsTrigger>
            <TabsTrigger value="transactions" className="min-w-32 px-3">Transactions</TabsTrigger>
            <TabsTrigger value="attendees" className="min-w-28 px-3">Attendees</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview" className="min-w-0">
          <EventOverviewTab event={event} />
        </TabsContent>
        <TabsContent value="transactions" className="min-w-0">
          <EventTransactionsTab eventId={event.id} />
        </TabsContent>
        <TabsContent value="attendees" className="min-w-0">
          <EventAttendeesTab eventId={event.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
