import { Wallet, Clock, Building2, Wrench, Sun, Moon, CloudSun } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { dashboardStats, formatKES } from '@/lib/mock-data';

// Dynamic greeting based on time
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', icon: Sun };
  if (hour < 17) return { text: 'Good afternoon', icon: CloudSun };
  return { text: 'Good evening', icon: Moon };
}

export default function LandlordDashboard() {
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  return (
    <DashboardLayout
      title={
        <span className="flex items-center gap-2">
          <GreetingIcon className="h-7 w-7 text-primary" />
          {greeting.text}, Joseph! 👋
        </span>
      }
      description="Here's what's happening with your properties today"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatsCard
          title="Total Revenue"
          value={formatKES(dashboardStats.totalRevenue)}
          subtitle="This month"
          icon={Wallet}
          variant="primary"
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="Pending Rent"
          value={formatKES(dashboardStats.pendingRent)}
          subtitle="From 5 tenants"
          icon={Clock}
          trend={{ value: 12, isPositive: false }}
        />
        <StatsCard
          title="Occupancy Rate"
          value={`${dashboardStats.occupancyRate}%`}
          subtitle={`${dashboardStats.totalTenants} of ${dashboardStats.totalUnits} units`}
          icon={Building2}
          trend={{ value: 3, isPositive: true }}
        />
        <StatsCard
          title="Open Repairs"
          value={String(dashboardStats.openRepairs)}
          subtitle="2 high priority"
          icon={Wrench}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </DashboardLayout>
  );
}
