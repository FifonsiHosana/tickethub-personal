// import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DeliveryChart } from "@/components/sections/Dashboard/Organizer/SMS/DeliveryChart";
// import { CreditUsage } from "@/components/sections/Dashboard/Organizer/SMS/CreditUsage";
import { StatCard } from "@/components/sections/Dashboard/Organizer/SMS/StatCard";
// import DashboardLayout from "@/layout/DashboardLayout";
import { MessageSquare, Users, CheckCircle2, TrendingUp } from "lucide-react";

export default function SmsAnalytics() {
  return (
    // <DashboardLayout>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Messages sent"
            value="24.8K"
            delta="12%"
            trend="up"
            icon={<MessageSquare className="size-5" />}
          />
          <StatCard
            label="Failed Messages"
            value="18.2K"
            delta="4%"
            trend="up"
            icon={<Users className="size-5" />}
          />
          <StatCard
            label="Delivery rate"
            value="97.4%"
            delta="1.2%"
            trend="up"
            icon={<CheckCircle2 className="size-5" />}
          />
          <StatCard
            label="Usage"
            value="8.9%"
            delta="2.1%"
            trend="down"
            icon={<TrendingUp className="size-5" />}
          />
        </div>
        
        {/* Delivery chart */}
        <DeliveryChart />

        {/* Credit Usage */}
        {/* <CreditUsage total={50000} used={44500} /> */}
      </div>
  );
}
