import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckIn() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#1a201c]">
          Check-In Dashboard
        </h2>
        <p className="text-muted-foreground mt-1 font-sans">
          Scan tickets and validate attendee entry.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            QR scanner, ticket validation, and attendance tracking will be built
            here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
