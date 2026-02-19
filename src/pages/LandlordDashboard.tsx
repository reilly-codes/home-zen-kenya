import { Wallet, Clock, Building2, Wrench, Sun, Moon, CloudSun } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { dashboardStats, formatKES, monthlyRentData } from '@/lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Dynamic greeting based on time
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', icon: Sun };
  if (hour < 17) return { text: 'Good afternoon', icon: CloudSun };
  return { text: 'Good evening', icon: Moon };
}

const utilityData = [
  { month: 'Jul', water: 45000, electricity: 82000, garbage: 15000 },
  { month: 'Aug', water: 48000, electricity: 78000, garbage: 15000 },
  { month: 'Sep', water: 42000, electricity: 85000, garbage: 15000 },
  { month: 'Oct', water: 50000, electricity: 90000, garbage: 15000 },
  { month: 'Nov', water: 47000, electricity: 88000, garbage: 15000 },
  { month: 'Dec', water: 52000, electricity: 95000, garbage: 15000 },
];

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
          <div className="grid gap-6">
            {/* Rent Collection Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Rent Collection Overview</CardTitle>
                <CardDescription>Monthly comparison of collected vs unpaid rent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRentData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="month"
                        className="text-muted-foreground"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                        className="text-muted-foreground"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip
                        formatter={(value: number) => formatKES(value)}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend />
                      <Bar
                        dataKey="collected"
                        name="Collected"
                        fill="hsl(var(--chart-1))"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="unpaid"
                        name="Unpaid"
                        fill="hsl(var(--chart-4))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </DashboardLayout>
  );
}
