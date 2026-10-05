import { useParams } from "react-router";
import { OrganizerDetailSection } from "@/components/sections/Dashboard/Admin/Organizers/Detail/OrganizerDetailSection";

export default function AdminOrganizerDetail() {
  const params = useParams();
  const organizerId = Number(params.id);

  if (!Number.isFinite(organizerId) || organizerId <= 0) {
    return <div className="py-8 text-center text-muted-foreground">Invalid organizer.</div>;
  }

  return <OrganizerDetailSection organizerId={organizerId} />;
}
