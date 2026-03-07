import { useState, useMemo } from "react";
import { Plus, Wallet, FileText, Hammer, Banknote, MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { format, subDays, isAfter } from "date-fns";
import { formatKES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Payment } from "@/services/payment.service";
import { Invoice } from "@/services/rentinvoice.service";
import { Tenant } from "@/services/tenant.service";
import { PaymentForm } from "@/components/forms/PaymentForm";

const statusStyles: Record<string, string> = {
    verified: 'bg-success/10 text-success border-success/20',
    unverified: 'bg-warning/10 text-warning border-warning/20',
    failed: 'bg-destructive/10 text-destructive border-destructive/20',
};

interface PaymentsTabProps {
    payments: Payment[];
    rentInvoices: Invoice[];
    tenants: Tenant[];
    onPaymentCreated: (payment: Payment) => void;
    onPaymentUpdated: (payment: Payment) => void;
}

export function PaymentsTab({
    payments,
    rentInvoices,
    tenants,
    onPaymentCreated,
    onPaymentUpdated,
}: PaymentsTabProps) {
    const [paymentFormOpen, setPaymentFormOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    const recentPayments = useMemo(() => {
        const thirtyDaysAgo = subDays(new Date(), 30);
        return payments
            .filter(p => isAfter(new Date(p.created_at), thirtyDaysAgo))
            .sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
    }, [payments]);

    const handleOpenCreate = () => {
        setSelectedPayment(null);
        setPaymentFormOpen(true);
    };

    const handleOpenEdit = (payment: Payment) => {
        setSelectedPayment(payment);
        setPaymentFormOpen(true);
    };

    const handleSuccess = (savedPayment: Payment, isEdit: boolean) => {
        if (isEdit) {
            onPaymentUpdated(savedPayment);
        } else {
            onPaymentCreated(savedPayment);
        }
    };

    const getPaymentMeta = (payment: Payment) => {
        if (payment.invoice_id) {
            return {
                label: 'Rent',
                icon: <FileText className="h-3 w-3" />,
                className: 'bg-blue-100 text-blue-600',
            };
        }
        return {
            label: 'General',
            icon: <Wallet className="h-3 w-3" />,
            className: 'bg-gray-100 text-gray-600',
        };
    };

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b bg-muted/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="font-semibold">Recent Payments (Last 30 Days)</h3>
                    <p className="text-xs text-muted-foreground">
                        Showing {recentPayments.length} records
                    </p>
                </div>
                <Button onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Record Payment
                </Button>
            </div>

            {/* Table */}
            {recentPayments.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                    <Banknote className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No payments recorded in the last 30 days.</p>
                </div>
            ) : (
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Reference</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                            <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {recentPayments.map(payment => {
                            const meta = getPaymentMeta(payment);
                            return (
                                <tr
                                    key={payment.id}
                                    className="hover:bg-muted/5 transition-colors"
                                >
                                    <td className="p-4">
                                        <p>{format(new Date(payment.created_at), "MMM dd, yyyy")}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(payment.created_at), "HH:mm")}
                                        </p>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("p-1.5 rounded-full", meta.className)}>
                                                {meta.icon}
                                            </div>
                                            <span className="font-medium">{meta.label}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-xs">
                                        {payment.transaction_ref}
                                    </td>
                                    <td className="p-4 font-semibold">
                                        {formatKES(payment.amount_paid)}
                                    </td>
                                    <td className="p-4">
                                        <Badge
                                            variant="outline"
                                            className={statusStyles[payment.status?.toLowerCase()] ?? ''}
                                        >
                                            {payment.status}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => handleOpenEdit(payment)}
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit Details
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {/* Payment form */}
            <PaymentForm
                open={paymentFormOpen}
                onOpenChange={setPaymentFormOpen}
                tenants={tenants}
                rentInvoices={rentInvoices}
                initialData={selectedPayment}
                onSuccess={handleSuccess}
            />
        </div>
    );
}