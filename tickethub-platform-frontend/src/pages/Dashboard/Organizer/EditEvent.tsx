import { useParams } from "react-router";
import EditEvent from "@/components/sections/Dashboard/Organizer/EventCreation/EditEvent";

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div className="p-8 text-center text-muted-foreground">Invalid event.</div>;
  }

  return <EditEvent eventId={id} />;
}
