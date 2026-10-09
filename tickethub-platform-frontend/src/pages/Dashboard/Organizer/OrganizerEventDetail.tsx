import { useParams } from "react-router";
import { OrganizerEventDetailPage } from "@/components/sections/Dashboard/Organizer/EventDetail/OrganizerEventDetailPage";

export default function OrganizerEventDetail() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div className="p-8 text-center text-muted-foreground">Invalid event.</div>;
  }

  return <OrganizerEventDetailPage eventIdentifier={id} />;
}