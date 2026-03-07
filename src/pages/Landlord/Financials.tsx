import { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Wallet, BarChart3 } from "lucide-react";
import { useRentInvoices } from "@/hooks/useRentInvoices";
import { useMaintenanceInvoices } from "@/hooks/useMaintenanceInvoices";
import { usePayments } from "@/hooks/usePayments";
import { useTransactions } from "@/hooks/useTransactions";
import { useProperties } from "@/hooks/useProperties";
import { useTenants } from "@/hooks/useTenants";
import { InvoicesTab } from "@/components/financials/InvoicesTab";
import { PaymentsTab } from "@/components/financials/PaymentsTab";
import { ReconciliationTab } from "@/components/financials/ReconciliationTab";
import { formatKES } from "@/lib/mock-data";

export default function Financials() {
    const { properties } = useProperties();
    const { tenants } = useTenants();
    const {
        rentInvoices,
        addRentInvoice,
        updateRentInvoice,
    } = useRentInvoices();
    const {
        maintenanceInvoices,
        addMaintenanceInvoice,
        updateMaintenanceInvoice,
    } = useMaintenanceInvoices();
    const {
        payments,
        addPayment,
        updatePayment,
    } = usePayments();
    const {
        transactions,
        isLoading: transactionsLoading,
        refreshTransactions,
    } = useTransactions();

    const stats = useMemo(() => {
        const totalCollected = payments
            .filter(p => p.status === 'VERIFIED')
            .reduce((sum, p) => sum + p.amount_paid, 0);

        const pendingBills = rentInvoices
            .filter(i => i.status === 'UNPAID')
            .reduce((sum, i) => sum + i.amount, 0);

        const overdueTotal = rentInvoices
            .filter(i => i.status === 'UNPAID' && new Date(i.date_due) < new Date())
            .reduce((sum, i) => sum + i.amount, 0);

        const maintenanceCosts = maintenanceInvoices
            .filter(i => i.payment_status === 'UNPAID' && i.status === 'COMPLETED')
            .reduce((sum, i) => sum + i.total_amount, 0);

        return { totalCollected, pendingBills, overdueTotal, maintenanceCosts };
    }, [payments, rentInvoices, maintenanceInvoices]);

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">

                {/* ===== Page header ===== */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Financials</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Track rent collections, maintenance costs, and reconcile bank statements.
                    </p>
                </div>

                {/* ===== Stat cards ===== */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-xs text-muted-foreground">Total Collected</p>
                        <p className="text-2xl font-bold text-success mt-1">
                            {formatKES(stats.totalCollected)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Verified payments only
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-xs text-muted-foreground">Pending Bills</p>
                        <p className="text-2xl font-bold text-warning mt-1">
                            {formatKES(stats.pendingBills)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Unpaid rent invoices
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-xs text-muted-foreground">Overdue</p>
                        <p className="text-2xl font-bold text-destructive mt-1">
                            {formatKES(stats.overdueTotal)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Past due date
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-xs text-muted-foreground">Maintenance Due</p>
                        <p className="text-2xl font-bold text-blue-500 mt-1">
                            {formatKES(stats.maintenanceCosts)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Completed, unpaid repairs
                        </p>
                    </div>
                </div>

                {/* ===== Main tabs ===== */}
                <Tabs defaultValue="invoices">
                    <TabsList>
                        <TabsTrigger value="invoices" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Invoices
                        </TabsTrigger>
                        <TabsTrigger value="payments" className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Payments
                        </TabsTrigger>
                        <TabsTrigger value="reconciliation" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Reconciliation
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="invoices" className="mt-4">
                        <InvoicesTab
                            rentInvoices={rentInvoices}
                            maintenanceInvoices={maintenanceInvoices}
                            properties={properties}
                            onRentInvoiceCreated={addRentInvoice}
                            onMaintenanceInvoiceCreated={addMaintenanceInvoice}
                            onMaintenanceInvoiceUpdated={updateMaintenanceInvoice}
                        />
                    </TabsContent>

                    <TabsContent value="payments" className="mt-4">
                        <PaymentsTab
                            payments={payments}
                            rentInvoices={rentInvoices}
                            tenants={tenants}
                            onPaymentCreated={addPayment}
                            onPaymentUpdated={updatePayment}
                        />
                    </TabsContent>

                    <TabsContent value="reconciliation" className="mt-4">
                        <ReconciliationTab
                            transactions={transactions}
                            isLoading={transactionsLoading}
                            onStatementUploaded={refreshTransactions}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}