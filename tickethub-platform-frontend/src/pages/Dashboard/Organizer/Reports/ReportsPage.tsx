import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#1a201c]">
          Reports
        </h2>
        <p className="text-muted-foreground mt-1 font-sans">
          Export and download reports for your events.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Report generation for sales, attendance, and revenue data will be
            built here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
