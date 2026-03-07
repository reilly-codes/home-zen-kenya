import { useState, useEffect } from "react";
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, FileText } from "lucide-react";
import { paymentService, Payment, CreatePayment, UpdatePayment } from "@/services/payment.service";
import { Invoice } from "@/services/rentinvoice.service";
import { Tenant } from "@/services/tenant.service";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { formatKES } from "@/lib/mock-data";

type PaymentType = 'general' | 'rent';

interface PaymentFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tenants: Tenant[];
    rentInvoices: Invoice[];
    initialData?: Payment | null;   // present = edit mode
    onSuccess: (payment: Payment, isEdit: boolean) => void;
}

const emptyForm = {
    type: 'general' as PaymentType,
    link_id: '',
    tenant_id: '',
    amount_paid: 0,
    transaction_ref: '',
    status: 'UNVERIFIED',
};

export function PaymentForm({
    open,
    onOpenChange,
    tenants,
    rentInvoices,
    initialData,
    onSuccess,
}: PaymentFormProps) {
    const [form, setForm] = useState(emptyForm);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEdit = !!initialData?.id;

    // Populate form when editing an existing payment
    useEffect(() => {
        if (initialData) {
            // Determine payment type from which id is set
            const type: PaymentType = initialData.invoice_id ? 'rent' : 'general';
            const link_id = initialData.invoice_id || '';

            setForm({
                type,
                link_id,
                tenant_id: initialData.tenant_id || '',
                amount_paid: initialData.amount_paid,
                transaction_ref: initialData.transaction_ref,
                status: initialData.status,
            });
        } else {
            setForm(emptyForm);
        }
    }, [initialData, open]);

    // When payment type changes, clear the linked invoice
    const handleTypeChange = (type: PaymentType) => {
        if (isEdit) return; // type cannot change when editing
        setForm(prev => ({ ...prev, type, link_id: '' }));
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target as HTMLInputElement;
        setForm(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            let savedPayment: Payment;

            if (isEdit) {
                // Build update payload — includes status
                const payload: UpdatePayment = {
                    tenant_id: form.tenant_id,
                    amount_paid: Number(form.amount_paid),
                    amount_expected: getAmountExpected(),
                    transaction_ref: form.transaction_ref,
                    invoice_id: form.type === 'rent' ? form.link_id : null,
                    status: form.status,
                };
                savedPayment = await paymentService.update(initialData!.id, payload);
            } else {
                // Build create payload — no status
                const payload: CreatePayment = {
                    tenant_id: form.tenant_id,
                    amount_paid: Number(form.amount_paid),
                    amount_expected: getAmountExpected(),
                    transaction_ref: form.transaction_ref,
                    invoice_id: form.type === 'rent' ? form.link_id : null,
                };
                savedPayment = await paymentService.create(payload);
            }

            onSuccess(savedPayment, isEdit);
            onOpenChange(false);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to save payment.");
        } finally {
            setIsLoading(false);
        }
    };

    // Pre-fill amount_expected from the selected invoice
    const getAmountExpected = (): number => {
        if (form.type === 'rent' && form.link_id) {
            const invoice = rentInvoices.find(i => i.id === form.link_id);
            return invoice?.amount ?? 0;
        }
        return 0;
    };

    // Unpaid invoices only — no point paying an already paid invoice
    const unpaidInvoices = rentInvoices.filter(inv => inv.status !== 'PAID');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Edit Payment' : 'Record Payment'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Update payment details or verify this transaction.'
                            : 'Record a new payment received from a tenant.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    {error && (
                        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in slide-in-from-top-2 duration-300">
                            {error}
                        </div>
                    )}

                    {/* ===== 1. Payment Type ===== */}
                    <div className="space-y-2">
                        <Label>Payment Type</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div
                                onClick={() => handleTypeChange('general')}
                                className={cn(
                                    "cursor-pointer rounded-lg border p-3 text-center transition-all flex flex-col items-center gap-1",
                                    form.type === 'general'
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-border hover:bg-muted",
                                    isEdit && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <Wallet className="h-4 w-4" />
                                <span className="font-medium text-xs">General</span>
                            </div>
                            <div
                                onClick={() => handleTypeChange('rent')}
                                className={cn(
                                    "cursor-pointer rounded-lg border p-3 text-center transition-all flex flex-col items-center gap-1",
                                    form.type === 'rent'
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-border hover:bg-muted",
                                    isEdit && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <FileText className="h-4 w-4" />
                                <span className="font-medium text-xs">Rent Invoice</span>
                            </div>
                        </div>
                    </div>

                    {/* ===== 2. Link to Invoice (rent only) ===== */}
                    {form.type === 'rent' && (
                        <div className="space-y-2">
                            <Label>Select Invoice to Pay</Label>
                            <select
                                name="link_id"
                                value={form.link_id}
                                onChange={handleChange}
                                disabled={isEdit}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                                required
                            >
                                <option value="" disabled>
                                    Select an outstanding invoice
                                </option>
                                {unpaidInvoices.map(inv => (
                                    <option key={inv.id} value={inv.id}>
                                        Unit {inv.house?.number} — {formatKES(inv.amount)} (Due: {format(new Date(inv.date_due), 'MMM dd')})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* ===== 3. Tenant (general payments only) ===== */}
                    {form.type === 'general' && (
                        <div className="space-y-2">
                            <Label>Tenant</Label>
                            <select
                                name="tenant_id"
                                value={form.tenant_id}
                                onChange={handleChange}
                                disabled={isEdit}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                                required
                            >
                                <option value="" disabled>Select tenant</option>
                                {tenants.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* ===== 4. Amount & Reference ===== */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount_paid">Amount Paid (KES)</Label>
                            <Input
                                id="amount_paid"
                                name="amount_paid"
                                type="number"
                                value={form.amount_paid}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="transaction_ref">Transaction Ref</Label>
                            <Input
                                id="transaction_ref"
                                name="transaction_ref"
                                placeholder="e.g. QA12BZ3KP"
                                value={form.transaction_ref}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* ===== 5. Status — edit mode only ===== */}
                    {isEdit && (
                        <div className="space-y-2">
                            <Label>Payment Status</Label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="UNVERIFIED">Unverified</option>
                                <option value="VERIFIED">Verified</option>
                                <option value="FAILED">Failed</option>
                            </select>
                        </div>
                    )}

                    <DialogFooter className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading
                                ? 'Saving...'
                                : isEdit ? 'Update Payment' : 'Record Payment'
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}