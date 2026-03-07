import { Wallet, FileText, ClipboardList, Calendar, Sun, Moon, CloudSun, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { tenants, recentPayments, formatKES } from '@/lib/mock-data';
import { toast } from 'sonner';

// Dynamic greeting based on time
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', icon: Sun };
  if (hour < 17) return { text: 'Good afternoon', icon: CloudSun };
  return { text: 'Good evening', icon: Moon };
}

export default function TenantDashboard() {
  // Get current tenant data (James Mwangi - tenant-1)
  const currentTenant = tenants.find(t => t.id === 'tenant-1')!;
  const tenantPayments = recentPayments.filter(p => p.tenantId === 'tenant-1');
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const handlePayNow = () => {
    toast.info('Redirecting to M-Pesa payment gateway...', {
      description: 'This would integrate with M-Pesa STK Push in production.',
    });
  };

  return (
    <DashboardLayout
      title={
        <span className="flex items-center gap-2">
          <GreetingIcon className="h-7 w-7 text-primary" />
          Welcome home, James! 👋
        </span>
      }
      description={`Unit ${currentTenant.unitNumber} • ${currentTenant.propertyName}`}
    >
      {/* Current Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatsCard
          title="Current Balance"
          value={currentTenant.balance > 0 ? formatKES(currentTenant.balance) : 'KES 0'}
          subtitle={currentTenant.balance > 0 ? 'Amount due' : 'All paid up!'}
          icon={Wallet}
          variant={currentTenant.balance > 0 ? 'default' : 'primary'}
        />
        <StatsCard
          title="Monthly Rent"
          value={formatKES(45000)}
          subtitle="Due 5th of each month"
          icon={Calendar}
        />
        <StatsCard
          title="Lease Ends"
          value="Jan 14, 2025"
          subtitle="32 days remaining"
          icon={FileText}
        />
        <StatsCard
          title="Open Requests"
          value="0"
          subtitle="No pending issues"
          icon={ClipboardList}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pay Now Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Make a Payment</CardTitle>
            <CardDescription>Pay your rent securely via M-Pesa or Bank Transfer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-6 bg-muted rounded-xl">
              <div>
                <p className="text-sm text-muted-foreground">Amount Due</p>
                <p className="text-3xl font-bold text-foreground">
                  {currentTenant.balance > 0 ? formatKES(currentTenant.balance) : formatKES(45000)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentTenant.balance > 0 ? 'Outstanding balance' : 'Next month\'s rent'}
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto" onClick={handlePayNow}>
                  <Wallet className="mr-2 h-5 w-5" />
                  Pay with M-Pesa
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Bank Transfer
                </Button>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="mt-6">
              <h4 className="font-medium mb-4">Recent Payments</h4>
              <div className="space-y-3">
                {tenantPayments.length > 0 ? (
                  tenantPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                      <div>
                        <p className="font-medium">{formatKES(payment.amount)}</p>
                        <p className="text-sm text-muted-foreground">{payment.date} • {payment.method}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-success/10 text-success">
                        {payment.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="empty-state py-8">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-primary/5 rounded-full scale-150 blur-xl" />
                      <Sparkles className="h-10 w-10 text-muted-foreground/40 relative" />
                    </div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">No payments yet</h3>
                    <p className="text-xs text-muted-foreground/70">Your payment history will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors text-left">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Lease Agreement</p>
                  <p className="text-sm text-muted-foreground">Signed Jan 15, 2024</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors text-left">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">House Rules</p>
                  <p className="text-sm text-muted-foreground">Property guidelines</p>
                </div>
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <ClipboardList className="mr-2 h-4 w-4" />
                Submit Repair Request
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                <FileText className="mr-2 h-4 w-4" />
                Submit Move-out Notice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
