import RecentOrdersTab from "@/components/sections/Dashboard/Organizer/DashboardOverview/RecentOrdersTab";

export default function OrganizerOrdersPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Ticket Orders
        </h1>
        <p className="text-sm text-muted-foreground">
          Review completed and pending ticket purchases.
        </p>
      </div>
      <RecentOrdersTab />
    </section>
  );
}
