import { useState } from "react";
import { Plus, FileText, Hammer, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatKES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Invoice } from "@/services/rentinvoice.service";
import { MaintenanceInvoice } from "@/services/maintenanceinvoice.service";
import { Property } from "@/services/property.service";
import { House } from "@/services/house.service";
import { Tenant } from "@/services/tenant.service";
import { RentInvoiceForm } from "@/components/forms/RentInvoiceForm";
import { MaintenanceInvoiceForm } from "@/components/forms/MaintenanceInvoiceForm";
import { BulkUploadInvoiceForm } from "@/components/forms/BulkUploadInvoiceForm";
import { InvoiceDetailDialog } from "@/components/dialogs/InvoiceDetailDialog";

const statusStyles: Record<string, string> = {
    paid: 'bg-success/10 text-success border-success/20',
    unpaid: 'bg-muted text-muted-foreground border-border',
    pending: 'bg-warning/10 text-warning border-warning/20',
    completed: 'bg-success/10 text-success border-success/20',
    in_progress: 'bg-blue-100 text-blue-600 border-blue-200',
};

interface InvoicesTabProps {
    rentInvoices: Invoice[];
    maintenanceInvoices: MaintenanceInvoice[];
    properties: Property[];
    units: House[];                                           
    tenants: Tenant[];                                        
    onRentInvoiceCreated: (invoice: Invoice) => void;
    onRentInvoicesRefreshed: () => void;                      
    onMaintenanceInvoiceCreated: (invoice: MaintenanceInvoice) => void;
    onMaintenanceInvoiceUpdated: (invoice: MaintenanceInvoice) => void;
}

export function InvoicesTab({
    rentInvoices,
    maintenanceInvoices,
    properties,
    units,
    tenants,
    onRentInvoiceCreated,
    onRentInvoicesRefreshed,
    onMaintenanceInvoiceCreated,
    onMaintenanceInvoiceUpdated,
}: InvoicesTabProps) {
    const [rentFormOpen, setRentFormOpen] = useState(false);
    const [maintenanceFormOpen, setMaintenanceFormOpen] = useState(false);
    const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);

    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | MaintenanceInvoice | null>(null);
    const [selectedInvoiceType, setSelectedInvoiceType] = useState<'rent' | 'maintenance'>('rent');
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
    const [invoiceTab, setInvoiceTab] = useState<'rent' | 'maintenance'>('rent');

    const handleViewRentInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setSelectedInvoiceType('rent');
        setDetailOpen(true);
        let house = units.find(u => u.id === invoice.tenant_unit?.hse_id);
        setSelectedHouse(house);
        let tenant = tenants.find(t => t.id === invoice.tenant_unit?.tenant_id);
        setSelectedTenant(tenant);
    };

    const handleViewMaintenanceInvoice = (invoice: MaintenanceInvoice) => {
        setSelectedInvoice(invoice);
        setSelectedInvoiceType('maintenance');
        setDetailOpen(true);
    };

    return (
        <div className="space-y-4">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="font-semibold">
                        {invoiceTab === 'rent' ? 'Rent Invoices' : 'Maintenance Bills'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {invoiceTab === 'rent'
                            ? `${rentInvoices.length} total invoices`
                            : `${maintenanceInvoices.length} total bills`
                        }
                    </p>
                </div>

                <div className="flex gap-2">
                    {invoiceTab === 'rent' && (
                        <Button variant="outline" onClick={() => setBulkUploadOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Bulk Upload
                        </Button>
                    )}
                    <Button
                        onClick={() => invoiceTab === 'rent'
                            ? setRentFormOpen(true)
                            : setMaintenanceFormOpen(true)
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {invoiceTab === 'rent' ? 'Generate Invoice' : 'Create Bill'}
                    </Button>
                </div>
            </div>

            {/* Sub-tabs */}
            <Tabs
                value={invoiceTab}
                onValueChange={(v) => setInvoiceTab(v as 'rent' | 'maintenance')}
            >
                <TabsList>
                    <TabsTrigger value="rent" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Rent Invoices
                    </TabsTrigger>
                    <TabsTrigger value="maintenance" className="flex items-center gap-2">
                        <Hammer className="h-4 w-4" />
                        Maintenance Bills
                    </TabsTrigger>
                </TabsList>

                {/* ===== Rent Invoices Table ===== */}
                <TabsContent value="rent">
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        {rentInvoices.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No rent invoices yet.</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left p-4 font-medium text-muted-foreground">Unit</th>
                                        <th className="text-left p-4 font-medium text-muted-foreground">Tenant</th>
                                        <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                                        <th className="text-left p-4 font-medium text-muted-foreground">Due Date</th>
                                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                                        <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {rentInvoices.map(invoice => (
                                        <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="p-4 font-medium">
                                                {units.find(u => u.id === invoice.tenant_unit?.hse_id)?.number ?? '—'}
                                            </td>
                                            <td className="p-4 text-muted-foreground">
                                                {tenants.find(t => t.id === invoice.tenant_unit?.tenant_id)?.name ?? '—'}
                                            </td>
                                            <td className="p-4 font-semibold">
                                                {formatKES(invoice.amount)}
                                            </td>
                                            <td className="p-4 text-muted-foreground">
                                                {invoice.date_due
                                                    ? format(new Date(invoice.date_due), 'MMM dd, yyyy')
                                                    : '—'
                                                }
                                            </td>
                                            <td className="p-4">
                                                <Badge
                                                    variant="outline"
                                                    className={statusStyles[invoice.status?.toLowerCase()] ?? ''}
                                                >
                                                    {invoice.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewRentInvoice(invoice)}
                                                >
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </TabsContent>

                {/* ===== Maintenance Bills Table ===== */}
                <TabsContent value="maintenance">
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        {maintenanceInvoices.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <Hammer className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No maintenance bills yet.</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left p-4 font-medium text-muted-foreground">Unit</th>
                                        <th className="text-left p-4 font-medium text-muted-foreground">Title</th>
                                        <th className="text-left p-4 font-medium text-muted-foreground">Total Cost</th>
                                        <th className="text-left p-4 font-medium text-muted-foreground">Repair Status</th>
                                        {/* <th className="text-left p-4 font-medium text-muted-foreground">Payment Status</th> */}
                                        <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {maintenanceInvoices.map(bill => (
                                        <tr key={bill.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="p-4 font-medium">
                                                {bill.house?.number ?? '—'}
                                            </td>
                                            <td className="p-4">
                                                <p className="font-medium">{bill.title}</p>
                                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                    {bill.description}
                                                </p>
                                            </td>
                                            <td className="p-4 font-semibold">
                                                {bill.status === "PENDING" && bill.total_amount === null ? "Uninvoiced" : formatKES(bill.total_amount)}
                                            </td>
                                            <td className="p-4">
                                                <Badge
                                                    variant="outline"
                                                    className={statusStyles[bill.status?.toLowerCase()] ?? ''}
                                                >
                                                    {bill.status}
                                                </Badge>
                                            </td>
                                            {/* <td className="p-4">
                                                <Badge
                                                    variant="outline"
                                                    className={statusStyles[bill.payment_status?.toLowerCase()] ?? ''}
                                                >
                                                    {bill.payment_status}
                                                </Badge>
                                            </td> */}
                                            <td className="p-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewMaintenanceInvoice(bill)}
                                                >
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* ===== Forms and dialogs ===== */}
            <BulkUploadInvoiceForm
                open={bulkUploadOpen}
                onOpenChange={setBulkUploadOpen}
                properties={properties}
                onSuccess={onRentInvoicesRefreshed}
            />

            <RentInvoiceForm
                open={rentFormOpen}
                onOpenChange={setRentFormOpen}
                properties={properties}
                onSuccess={onRentInvoiceCreated}
            />

            <MaintenanceInvoiceForm
                open={maintenanceFormOpen}
                onOpenChange={setMaintenanceFormOpen}
                properties={properties}
                onSuccess={onMaintenanceInvoiceCreated}
            />

            <InvoiceDetailDialog
                open={detailOpen}
                onOpenChange={setDetailOpen}
                invoice={selectedInvoice}
                invoiceType={selectedInvoiceType}
                properties={properties}
                onMaintenanceUpdated={(updated) => {
                    onMaintenanceInvoiceUpdated(updated);
                    setDetailOpen(false);
                }}
                hse={selectedHouse}
                tenant={selectedTenant}
            />
        </div>
    );
}