import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useBecomeOrganizer } from "@/hooks/useAuth";
import { useAuthStorage } from "@/hooks/useAuthStorage";

export function CreateEventButton() {
  const navigate = useNavigate();
  const { roles, setAuth } = useAuthStorage();
  const { mutateAsync: upgradeToOrganizer, isPending: isUpgrading } =
    useBecomeOrganizer();

  const isAttendeeOnly =
    roles.length === 1 && roles.includes("attendee");

  if (!isAttendeeOnly) return null;

  async function handleCreateEvent() {
    try {
      const result = await upgradeToOrganizer();
      setAuth({
        token: result.data.token,
        user: result.data.user,
        activeRole: "organizer",
      });
      toast.success("You can now create events!");
      navigate("/organizer/events/new");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to upgrade your account.";
      toast.error(message);
    }
  }

  return (
    <Button
      onClick={handleCreateEvent}
      disabled={isUpgrading}
      className="h-8 rounded-full px-4 text-xs font-medium"
    >
      {isUpgrading ? "Upgrading..." : "Create Event"}
    </Button>
  );
}