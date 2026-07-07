import { Activity, Eye, MessageSquareQuote, Users } from "lucide-react";
import StatCard from "@/components/admin/StatCard";

const stats = [
  { label: "Total Users", value: "128", icon: Users, trend: "+12 this week" },
  { label: "Total Messages", value: "842", icon: MessageSquareQuote, trend: "+18% from last week" },
  { label: "Total Visits", value: "3.4k", icon: Eye, trend: "+8% this month" },
  { label: "Recent Activity", value: "24", icon: Activity, trend: "New updates today" },
];

const activityItems = [
  { title: "New consultant application received", time: "10 mins ago" },
  { title: "3 new messages in the community hub", time: "32 mins ago" },
  { title: "Dashboard access reviewed by admin", time: "1 hour ago" },
];

export default function AdminOverview() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">A quick overview of your platform activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Recent Activity</h2>
            <span className="text-xs text-primary">Live</span>
          </div>
          <div className="space-y-4">
            {activityItems.map((item) => (
              <div key={item.title} className="flex items-start justify-between gap-3 rounded-md border border-border/70 bg-background/50 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                </div>
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Quick Notes</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-6">
            This temporary dashboard uses placeholder values so the admin area is immediately usable while the full backend integration is prepared.
          </p>
          <div className="mt-5 rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            Keep reviewing the admin modules to connect the live data sources next.
          </div>
        </div>
      </div>
    </div>
  );
}
