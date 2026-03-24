import { useEffect, useState } from 'react';
import { Wallet, Clock, Building2, Wrench, Sun, Moon, CloudSun } from 'lucide-react';
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { dashboardStats, formatKES, monthlyRentData } from '@/lib/mock-data';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    Card, CardContent, CardDescription,
    CardHeader, CardTitle
} from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { useProperties } from '@/hooks/useProperties';
import { useAllUnits } from '@/hooks/useAllUnits';
import { useTenants } from '@/hooks/useTenants';
import { useRentInvoices } from '@/hooks/useRentInvoices';
import { usePayments } from '@/hooks/usePayments';
import { TenantForm } from '@/components/forms/TenantForm';
import { PaymentForm } from '@/components/forms/PaymentForm';
import { BroadcastForm } from '@/components/forms/BroadcastForm';
import { ReconciliationTab } from '@/components/financials/ReconciliationTab';
import { useTransactions } from '@/hooks/useTransactions';
import { useMaintenanceRequests } from '@/hooks/useMaintenanceRequests';
import { useReports } from '@/hooks/useReports';

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: Sun };
    if (hour < 17) return { text: 'Good afternoon', icon: CloudSun };
    return { text: 'Good evening', icon: Moon };
}

export default function LandlordDashboard() {
    const greeting = getGreeting();
    const GreetingIcon = greeting.icon;

    const { userProfile, isProfileLoading } = useUser();

    const { properties } = useProperties();
    const { units } = useAllUnits();
    const { tenants } = useTenants();
    const { maintenanceRequests } = useMaintenanceRequests();
    const { rentInvoices, addRentInvoice } = useRentInvoices();
    const { payments, addPayment, updatePayment } = usePayments();
    const { transactions, isLoading: transactionsLoading, refreshTransactions } = useTransactions();
    const { monthlyRentData } = useReports(rentInvoices, payments);

    const [tenantFormOpen, setTenantFormOpen] = useState(false);
    const [paymentFormOpen, setPaymentFormOpen] = useState(false);
    const [broadcastFormOpen, setBroadcastFormOpen] = useState(false);
    const [uploadStatementOpen, setUploadStatementOpen] = useState(false);

    const totalCollected = payments
        .filter(p => p.status === 'VERIFIED')
        .reduce((sum, p) => sum + p.amount_paid, 0);

    const pendingTotalBills = rentInvoices
        .filter(i => i.status === 'UNPAID')
        .reduce((sum, i) => sum + i.amount, 0);

    const pendingInvoiceCount = rentInvoices
        .filter(i => i.status === 'UNPAID').length;

    const repairCounter = maintenanceRequests
        .filter(r => r.status != "COMPLETED").length;

    const occupiedUnits = units
        .filter(u => u.status === "OCCUPIED").length;

    return (
        <DashboardLayout
            title={
                <span className="flex items-center gap-2">
                    <GreetingIcon className="h-7 w-7 text-primary" />
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
                    subtitle="Verified payments"
                    icon={Wallet}
                    variant="primary"
                />
                <StatsCard
                    title="Pending Rent"
                    value={formatKES(pendingTotalBills)}
                    subtitle={`From ${pendingInvoiceCount} invoices`}
                    icon={Clock}
                // trend={{ value: 12, isPositive: false }}
                />
                <StatsCard
                    title="Occupancy Rate"
                    value={`${((occupiedUnits / units.length) * 100).toFixed(2)}%`}
                    subtitle={`${occupiedUnits} of ${units.length} units`}
                    icon={Building2}
                // trend={{ value: 3, isPositive: true }}
                />
                <StatsCard
                    title="Open Repairs"
                    value={String(repairCounter)}
                    icon={Wrench}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rent Collection Overview</CardTitle>
                            <CardDescription>
                                Monthly comparison of collected vs unpaid rent
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {monthlyRentData.length === 0 ? (
                                <div className="h-[350px] flex items-center justify-center text-muted-foreground text-sm">
                                    No invoice data yet.
                                </div>
                            ) : (
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyRentData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                className="stroke-border"
                                            />
                                            <XAxis
                                                dataKey="month"
                                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                            />
                                            <YAxis
                                                tickFormatter={(v) =>
                                                    v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v
                                                }
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
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <QuickActions
                        onAddTenant={() => setTenantFormOpen(true)}
                        onLogPayment={() => setPaymentFormOpen(true)}
                        onBroadcast={() => setBroadcastFormOpen(true)}
                        onUploadStatement={() => setUploadStatementOpen(true)}
                    />
                </div>
            </div>

            {/* ===== Quick action forms ===== */}
            <TenantForm
                open={tenantFormOpen}
                onOpenChange={setTenantFormOpen}
                properties={properties}
                onSuccess={() => { }}
            />

            <PaymentForm
                open={paymentFormOpen}
                onOpenChange={setPaymentFormOpen}
                tenants={tenants}
                rentInvoices={rentInvoices}
                initialData={null}
                onSuccess={(saved, isEdit) => {
                    isEdit ? updatePayment(saved) : addPayment(saved);
                }}
            />

            <BroadcastForm
                open={broadcastFormOpen}
                onOpenChange={setBroadcastFormOpen}
                tenants={tenants}
            />

            {/* Upload statement reuses ReconciliationTab in a dialog */}
            <Dialog open={uploadStatementOpen} onOpenChange={setUploadStatementOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Upload Bank Statement</DialogTitle>
                        <DialogDescription>
                            Upload a CSV or Excel file to reconcile transactions.
                        </DialogDescription>
                    </DialogHeader>
                    <ReconciliationTab
                        transactions={transactions}
                        isLoading={transactionsLoading}
                        onStatementUploaded={async () => {
                            await refreshTransactions();
                            setUploadStatementOpen(false);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}