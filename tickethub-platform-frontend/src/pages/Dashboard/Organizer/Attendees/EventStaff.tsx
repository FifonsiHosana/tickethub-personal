import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LinkIcon, Calendars, CopyIcon, UserPlusIcon } from "lucide-react";
import EventSelectDropdown from "@/components/sections/Dashboard/Organizer/Shared/EventSelectDropdown";
import StaffTable from "@/components/sections/Dashboard/Organizer/Attendees/StaffTable";
import AssignStaffDialog from "@/components/sections/Dashboard/Organizer/Attendees/AssignStaffDialog";
import { useEventStaff, useGenerateStaffInvite } from "@/hooks/organizers/useOrganizerStaff";

export default function EventStaff() {
  const [eventId, setEventId] = useState<string>("");
  const [assignOpen, setAssignOpen] = useState(false);
  const { data: staff = [], isLoading, refetch } = useEventStaff(eventId ? Number(eventId) : null);
  const { mutateAsync: generateInvite, isPending: isGenerating } = useGenerateStaffInvite();

  async function handleGenerateInvite() {
    if (!eventId) return;
    try {
      const { inviteUrl } = await generateInvite(Number(eventId));
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Invite link copied to clipboard!");
    } catch {
      toast.error("Failed to generate invite link.");
    }
  }

  return (
    <div className="flex-1 space-y-6 p-1">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Event Staff
        </h2>
        <p className="text-muted-foreground mt-1 font-sans">
          Manage staff assigned to your events.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <EventSelectDropdown
          value={eventId}
          onChange={(val) => setEventId(val)}
        />
        {eventId && (
          <>
            <Button
              onClick={handleGenerateInvite}
              disabled={isGenerating}
              className="bg-primary text-white hover:bg-primary/60"
            >
              {isGenerating ? (
                <CopyIcon className="h-4 w-4 mr-1" />
              ) : (
                <LinkIcon className="h-4 w-4 mr-1" />
              )}
              {isGenerating ? "Generating..." : "Generate Invite Link"}
            </Button>
            <Button
              onClick={() => setAssignOpen(true)}
              variant="outline"
            >
              <UserPlusIcon className="h-4 w-4 mr-1" />
              Assign Staff
            </Button>
          </>
        )}
      </div>

      {!eventId && (
        <div className="flex flex-col bg-card text-center rounded border border-border items-center justify-center py-32">
          <Calendars className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">Kindly select an event</h3>
        </div>
      )}

      {eventId && <StaffTable data={staff} isLoading={isLoading} />}

      {eventId && (
        <AssignStaffDialog
          open={assignOpen}
          onOpenChange={setAssignOpen}
          eventId={Number(eventId)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
