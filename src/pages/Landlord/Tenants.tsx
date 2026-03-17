import { useState, useMemo } from 'react';
import { Plus, MessageSquare, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatKES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useTenants } from '@/hooks/useTenants';
import { useProperties } from '@/hooks/useProperties';
import { useAllUnits } from '@/hooks/useAllUnits';
import { Tenant } from '@/services/tenant.service';
import { TenantForm } from '@/components/forms/TenantForm';
import { TenantDetailDialog } from '@/components/dialogs/TenantDetailDialog';
import { BroadcastForm } from '@/components/forms/BroadcastForm';
import { useRentInvoices } from '@/hooks/useRentInvoices';

const statusStyles: Record<string, string> = {
    active: 'bg-success/10 text-success border-success/20',
    'moving-out': 'bg-warning/10 text-warning border-warning/20',
    pending: 'bg-muted text-muted-foreground border-border',
};

export default function Tenants() {
    const { tenants, isLoading, addTenant } = useTenants();
    const { properties } = useProperties();
    const { units: allUnits } = useAllUnits();
    const { rentInvoices } = useRentInvoices();

    const [addTenantOpen, setAddTenantOpen] = useState(false);
    const [viewTenantOpen, setViewTenantOpen] = useState(false);
    const [broadcastOpen, setBroadcastOpen] = useState(false);

    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

    const [searchQuery, setSearchQuery] = useState('');

    const filteredTenants = tenants.filter(tenant => {
        const query = searchQuery.toLowerCase();
        const matchesName = tenant.name.toLowerCase().includes(query);
        const unit = allUnits.find(u => u.id === tenant.houses[0].hse_id);
        const matchesUnit = unit?.number.toLowerCase().includes(query);
        return matchesName || matchesUnit;
    });

    
    const tenantBalances = useMemo(() => {
        const balances: Record<string, number> = {};

        rentInvoices.forEach(inv => {
            if (
                inv.status === "UNPAID" &&
                inv.tenant_id &&
                new Date(inv.date_due) > new Date()
            ) {
                if (!balances[inv.tenant_id]) balances[inv.tenant_id] = 0;
                balances[inv.tenant_id] += Number(inv.amount ?? 0);
            }
        });

        return balances;
    }, [rentInvoices]);

    const handleTenantCreated = (newTenant: Tenant) => {
        addTenant(newTenant);
    };

    const handleViewTenant = (tenant: Tenant) => {
        setSelectedTenant(tenant);
        setViewTenantOpen(true);
    };

    return (
        <DashboardLayout
            title="Tenants"
            description="Manage tenants and communication"
        >
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or unit..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => setBroadcastOpen(true)}
                        className="flex-1 sm:flex-initial"
                    >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Broadcast
                    </Button>
                    <Button
                        className="flex-1 sm:flex-initial"
                        onClick={() => setAddTenantOpen(true)}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Tenant
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{tenants.length}</p>
                    <p className="text-sm text-muted-foreground">Total Tenants</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                    <p className="text-2xl font-bold text-success">
                        {tenants.filter(t => t.status?.toLowerCase() === 'active').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Active</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                    <p className="text-2xl font-bold text-warning">
                        {tenants.filter(t => t.status?.toLowerCase() === 'moving_out').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Moving Out</p>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <p className="text-muted-foreground text-sm">Loading tenants...</p>
            )}

            {/* Desktop Table */}
            {!isLoading && (
                <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tenant</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Unit</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Phone</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Balance</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredTenants.map((tenant) => {
                                const unit = allUnits.find(u => u.id === tenant.houses[0].hse_id);
                                const property = properties.find(p => p.id === unit?.property_id);
                                const currentBalance = tenantBalances[tenant.id] ?? 0;

                                return (
                                    <tr key={tenant.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-primary">
                                                        {tenant.name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{tenant.name}</p>
                                                    <p className="text-sm text-muted-foreground">{tenant.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-medium">{unit?.number ?? '—'}</p>
                                            <p className="text-sm text-muted-foreground">{property?.name ?? '—'}</p>
                                        </td>
                                        <td className="p-4 text-muted-foreground">{tenant.tel}</td>
                                        <td className="p-4">
                                            <span className={cn(
                                                "font-medium",
                                                currentBalance > 0 ? "text-destructive" : "text-success"
                                            )}>
                                                {currentBalance > 0 ? formatKES(currentBalance) : 'Paid'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <Badge
                                                variant="outline"
                                                className={statusStyles[tenant.status?.toLowerCase()] ?? ''}
                                            >
                                                {tenant.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleViewTenant(tenant)}
                                            >
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Mobile Card View */}
            {!isLoading && (
                <div className="md:hidden space-y-3">
                    {filteredTenants.map((tenant) => {
                        const unit = allUnits.find(u => u.id === tenant.hse);
                        const currentBalance = tenantBalances[tenant.id] ?? 0;

                        return (
                            <div
                                key={tenant.id}
                                className="bg-card rounded-xl border border-border p-4 cursor-pointer"
                                onClick={() => handleViewTenant(tenant)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-sm font-medium text-primary">
                                                {tenant.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{tenant.name}</p>
                                            <p className="text-sm text-muted-foreground">{unit?.number ?? '—'}</p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={statusStyles[tenant.status?.toLowerCase()] ?? ''}
                                    >
                                        {tenant.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
                                    <span className="text-muted-foreground">{tenant.tel}</span>
                                    <span className={cn(
                                        "font-medium",
                                        currentBalance > 0 ? "text-destructive" : "text-success"
                                    )}>
                                        {currentBalance > 0 ? formatKES(currentBalance) : 'Paid'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <TenantForm
                open={addTenantOpen}
                onOpenChange={setAddTenantOpen}
                properties={properties}
                onSuccess={handleTenantCreated}
            />

            <TenantDetailDialog
                open={viewTenantOpen}
                onOpenChange={setViewTenantOpen}
                tenant={selectedTenant}
                allUnits={allUnits}
                properties={properties}
                tenantBalance={selectedTenant ? (tenantBalances[selectedTenant.id] ?? 0) : 0}
            />

            <BroadcastForm
                open={broadcastOpen}
                onOpenChange={setBroadcastOpen}
                tenants={tenants}
            />

        </DashboardLayout>
    );
}