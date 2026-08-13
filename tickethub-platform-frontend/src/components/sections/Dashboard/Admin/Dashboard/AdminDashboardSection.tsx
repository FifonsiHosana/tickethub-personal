import { useAdminOverview } from "@/hooks/admin/useAdminAnalytics";
import { useDashboardDateRange } from "@/components/shared/date/useDashboardDateRange";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UsersIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ClockIcon,
  BanknoteIcon,
  PercentIcon,
  WalletIcon,
  TicketIcon,
} from "lucide-react";
import AdminEventsSection from "../Events/AdminEventsSection";

export default function AdminDashboardSection() {
  const { range } = useDashboardDateRange();
  const { data, isLoading } = useAdminOverview(
    range?.from ?? undefined,
    range?.to ?? undefined,
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    { title: "Total Users", value: data?.totalUsers.toLocaleString() ?? "0", icon: UsersIcon },
    { title: "Organizers", value: data?.totalOrganizers.toLocaleString() ?? "0", icon: ShieldCheckIcon },
    { title: "Attendees", value: data?.totalAttendees.toLocaleString() ?? "0", icon: TicketIcon },
    { title: "Total Events", value: data?.totalEvents.toLocaleString() ?? "0", icon: CalendarIcon },
    { title: "Pending Approvals", value: data?.pendingApprovals.toLocaleString() ?? "0", icon: ClockIcon },
    { title: "Revenue", value: `GH₵ ${(data?.totalRevenue ?? 0).toLocaleString()}`, icon: BanknoteIcon },
    { title: "Commission", value: `GH₵ ${(data?.totalCommission ?? 0).toLocaleString()}`, icon: PercentIcon },
    { title: "Payouts", value: `GH₵ ${(data?.totalPayouts ?? 0).toLocaleString()}`, icon: WalletIcon },
  ];

  return (
    <div className="flex-1 min-w-0 space-y-3 p-1">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="text-xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

        {/* Admin Events Section */}
      <div className="w-full">
        <AdminEventsSection />
      </div>
    </div>
  );
}
