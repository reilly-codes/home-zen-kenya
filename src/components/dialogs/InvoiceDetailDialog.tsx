import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, User, Calendar, Pencil } from "lucide-react";
import { useState } from 'react';
import { Invoice } from "@/services/rentinvoice.service";
import { MaintenanceInvoice, UpdateMaintenanceInvoice, maintenanceService } from "@/services/maintenanceinvoice.service";
import { Property } from "@/services/property.service";
import { formatKES } from "@/lib/mock-data";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type InvoiceType = 'rent' | 'maintenance';

const statusStyles: Record<string, string> = {
    paid: 'bg-success/10 text-success border-success/20',
    unpaid: 'bg-muted text-muted-foreground border-border',
    pending: 'bg-warning/10 text-warning border-warning/20',
    completed: 'bg-success/10 text-success border-success/20',
    in_progress: 'bg-blue-100 text-blue-600 border-blue-200',
    failed: 'bg-destructive/10 text-destructive border-destructive/20',
};

interface InvoiceDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    invoice: Invoice | MaintenanceInvoice | null;
    invoiceType: InvoiceType;
    properties: Property[];
    onMaintenanceUpdated: (updated: MaintenanceInvoice) => void;
    tenant?: any;
    hse?: any;
}

export function InvoiceDetailDialog({
    open,
    onOpenChange,
    invoice,
    invoiceType,
    properties,
    onMaintenanceUpdated,
    tenant,
    hse,
}: InvoiceDetailDialogProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [repairCosts, setRepairCosts] = useState({
        labor_cost: 0,
        parts_cost: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!invoice) return null;

    const isMaintenanceInvoice = invoiceType === 'maintenance';

    const propertyId = isMaintenanceInvoice
        ? invoice.house?.property_id
        : house?.property_id;

    const rentInvoice = !isMaintenanceInvoice ? (invoice as Invoice) : null;
    const maintenanceInvoice = isMaintenanceInvoice ? (invoice as MaintenanceInvoice) : null;

    const propertyName = properties.find(p => p.id === propertyId)?.name ?? '—';

    const canEditMaintenance =
        isMaintenanceInvoice &&
        maintenanceInvoice?.status !== 'COMPLETED';

    const handleEditCosts = () => {
        setRepairCosts({
            labor_cost: maintenanceInvoice?.labor_cost ?? 0,
            parts_cost: maintenanceInvoice?.parts_cost ?? 0,
        });
        setIsEditing(true);
    };

    const handleSaveCosts = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const payload: UpdateMaintenanceInvoice = {
                labor_cost: Number(repairCosts.labor_cost),
                parts_cost: Number(repairCosts.parts_cost),
            };
            const updated = await maintenanceService.update(invoice.id, payload);
            onMaintenanceUpdated(updated);
            setIsEditing(false);
            onOpenChange(false);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Could not update repair costs.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Invoice Details</DialogTitle>
                    <DialogDescription className="font-mono text-xs text-muted-foreground">
                        ID: {invoice.id}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-6">

                    {/* ===== Header — title + status ===== */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-lg">
                                {isMaintenanceInvoice
                                    ? maintenanceInvoice?.title
                                    : "Rent Invoice"
                                }
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {isMaintenanceInvoice
                                    ? maintenanceInvoice.house?.number 
                                    : hse.number 
                                } • {propertyName}
                                
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Badge
                                variant="outline"
                                className={statusStyles[invoice.status?.toLowerCase()] ?? ''}
                            >
                                {invoice.status}
                            </Badge>
                            {/* Maintenance shows both repair and payment status */}
                            {isMaintenanceInvoice && (
                                <Badge
                                    variant="outline"
                                    className={statusStyles[maintenanceInvoice?.payment_status?.toLowerCase()] ?? ''}
                                >
                                    {maintenanceInvoice?.payment_status}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {!isMaintenanceInvoice && invoice?.utilities && invoice.utilities.length > 0 && (
                        <div className="bg-muted/30 p-4 rounded-lg space-y-2 mt-4">
                            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Utility Breakdown
                            </span>
                            <div className="space-y-1 mt-2 text-sm">
                                {invoice.utilities.map((utility: any) => (
                                    <div key={utility.id} className="flex justify-between items-center">
                                        <span className="capitalize text-muted-foreground">
                                            {utility.bill_type.toLowerCase()}
                                        </span>
                                        <span className="font-medium">
                                            {formatKES(utility.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== Total amount ===== */}
                    <div className="bg-muted/50 p-4 rounded-lg flex justify-between items-center">
                        <span className="font-medium">Total Amount</span>
                        <span className="text-2xl font-bold font-mono">
                            {formatKES(
                                isMaintenanceInvoice
                                    ? maintenanceInvoice?.total_amount ?? 0
                                    : rentInvoice?.amount ?? 0
                            )}
                        </span>
                    </div>

                    {/* ===== Details grid ===== */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground block mb-1">Tenant</span>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                <span className="font-medium">
                                    {
                                        isMaintenanceInvoice
                                        ? "Landlord"
                                        : tenant.name ?? 'N/A'
                                    }
                                </span>
                            </div>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-1">Date</span>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span>
                                    {(() => {
                                        const dateStr = isMaintenanceInvoice
                                            ? maintenanceInvoice?.date_raised
                                            : rentInvoice?.date_of_gen;
                                        return dateStr
                                            ? format(new Date(dateStr), "MMM dd, yyyy")
                                            : '—';
                                    })()}
                                </span>
                            </div>
                        </div>

                        {/* Maintenance-only: show repair cost breakdown */}
                        {isMaintenanceInvoice && (
                            <>
                                <div>
                                    <span className="text-muted-foreground block mb-1">
                                        Labour Cost
                                    </span>
                                    <span className="font-medium">
                                        {formatKES(maintenanceInvoice?.labor_cost ?? 0)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">
                                        Parts Cost
                                    </span>
                                    <span className="font-medium">
                                        {formatKES(maintenanceInvoice?.parts_cost ?? 0)}
                                    </span>
                                </div>
                            </>
                        )}

                        {/* Rent-only: show due date */}
                        {!isMaintenanceInvoice && rentInvoice?.date_due && (
                            <div>
                                <span className="text-muted-foreground block mb-1">
                                    Due Date
                                </span>
                                <span className="font-medium">
                                    {format(new Date(rentInvoice.date_due), "MMM dd, yyyy")}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* ===== Edit repair costs form — maintenance only ===== */}
                    {isEditing && (
                        <form onSubmit={handleSaveCosts} className="space-y-4 border-t pt-4">
                            <p className="text-sm font-medium">Update Repair Costs</p>

                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="labor_cost">Labour Cost (KES)</Label>
                                    <Input
                                        id="labor_cost"
                                        type="number"
                                        value={repairCosts.labor_cost}
                                        onChange={(e) => setRepairCosts(prev => ({
                                            ...prev,
                                            labor_cost: Number(e.target.value)
                                        }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="parts_cost">Parts Cost (KES)</Label>
                                    <Input
                                        id="parts_cost"
                                        type="number"
                                        value={repairCosts.parts_cost}
                                        onChange={(e) => setRepairCosts(prev => ({
                                            ...prev,
                                            parts_cost: Number(e.target.value)
                                        }))}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Saving...' : 'Save Costs'}
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* ===== Footer actions ===== */}
                    {!isEditing && (
                        <DialogFooter className="gap-2">
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Close
                            </Button>
                            {canEditMaintenance && (
                                <Button
                                    variant="default"
                                    className="bg-warning"
                                    onClick={handleEditCosts}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Costs
                                </Button>
                            )}
                            <Button variant="default">
                                <FileText className="mr-2 h-4 w-4" />
                                Download PDF
                            </Button>
                        </DialogFooter>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}