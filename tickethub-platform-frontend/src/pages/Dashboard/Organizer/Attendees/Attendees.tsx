import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Attendees() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#1a201c]">
          Attendees
        </h2>
        <p className="text-muted-foreground mt-1 font-sans">
          View and manage attendees across your events.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Attendee management interface with search, CSV export, and manual
            check-in will be built here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
