import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { UserDetail } from "@/utils/services/admin/users.service";

export function OrganizerProfileHeader({ organizer }: { organizer: UserDetail }) {
  const name = [organizer.firstName, organizer.lastName].filter(Boolean).join(" ");
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{name || "Organizer"}</h1>
            <Badge variant={organizer.isActive ? "default" : "destructive"}>{organizer.isActive ? "Active" : "Suspended"}</Badge>
            <Badge variant={organizer.isVerified ? "default" : "secondary"}>{organizer.isVerified ? "Verified" : "Unverified"}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Organizer #{organizer.id}</p>
        </div>
        <div className="grid gap-1 text-sm text-muted-foreground md:text-right">
          <span>{organizer.email}</span>
          <span>{organizer.phoneNumber || "No phone number"}</span>
          <span>Joined {new Date(organizer.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
