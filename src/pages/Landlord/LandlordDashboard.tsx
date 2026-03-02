// pages/LandlordDashboard.tsx
import { useEffect, useState } from 'react';
import { Wallet, Clock, Building2, Wrench, Sun, Moon, CloudSun } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { dashboardStats, formatKES, monthlyRentData } from '@/lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { api } from '@/services/api';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', icon: Sun };
  if (hour < 17) return { text: 'Good afternoon', icon: CloudSun };
  return { text: 'Good evening', icon: Moon };
}

export default function LandlordDashboard() {
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  // userProfile comes from UserContext — no API call needed
  // it was fetched once during login and lives in memory
  const { userProfile, isProfileLoading } = useUser();

  const [payments, setPayments] = useState([]);
  const [rentInvoices, setRentInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFinancialData = async () => {
      setIsLoading(true);
      try {
        const [rentResponse, payResponse] = await Promise.all([
          api.get("/invoices/rent/all"),
          api.get("/payments/all"),
        ]);
        setRentInvoices(rentResponse.data);
        setPayments(payResponse.data);
      } catch (err) {
        console.error("Failed to fetch financial data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  let totalCollected = 0;
  let totalReconciled = 0;
  payments.forEach(pay => {
    totalCollected += pay.amount_paid;
    if (pay.status === "VERIFIED") {
      totalReconciled += pay.amount_paid;
    }
  });

  let pendingTotalBills = 0;
  let pendingInvoiceCount = 0;
  rentInvoices.forEach(invoice => {
    if (invoice.status === "UNPAID") {
      pendingTotalBills += invoice.amount;
      pendingInvoiceCount++;
    }
  });

  return (
    <DashboardLayout
      title={
        <span className="flex items-center gap-2">
          <GreetingIcon className="h-7 w-7 text-primary" />
          {/* Show a subtle placeholder while profile loads */}
          {greeting.text}, {isProfileLoading ? '...' : userProfile?.name} 👋
        </span>
      }
      description="Here's what's happening with your properties today"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatsCard
          title="Total Revenue"
          value={formatKES(totalCollected)}
          subtitle="This month"
          icon={Wallet}
          variant="primary"
        />
        <StatsCard
          title="Pending Rent"
          value={formatKES(pendingTotalBills)}
          subtitle={`From ${pendingInvoiceCount} tenants`}
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
        <div className="lg:col-span-2">
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
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
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
                    <Bar dataKey="collected" name="Collected" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="unpaid" name="Unpaid" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </DashboardLayout>
  );
}