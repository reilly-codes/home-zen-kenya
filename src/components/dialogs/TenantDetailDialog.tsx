import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MessageSquare } from 'lucide-react';
import { Tenant } from '@/services/tenant.service';
import { House } from '@/services/house.service';
import { Property } from '@/services/property.service';
import { formatKES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
    active: 'bg-success/10 text-success border-success/20',
    'moving-out': 'bg-warning/10 text-warning border-warning/20',
    pending: 'bg-muted text-muted-foreground border-border',
};

interface TenantDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tenant: Tenant | null;
    allUnits: House[];
    properties: Property[];
    tenantBalance: number;
}

export function TenantDetailDialog({
    open,
    onOpenChange,
    tenant,
    allUnits,
    properties,
    tenantBalance,
}: TenantDetailDialogProps) {
    // Guard — if no tenant selected, render nothing
    if (!tenant) return null;

    // Look up the unit and property this tenant belongs to
    const unit = allUnits.find(u => u.id === tenant.hse);
    const property = properties.find(p => p.id === unit?.property_id);

    // Generate initials from tenant name for the avatar
    const initials = tenant.name
        .split(' ')
        .map(n => n[0])
        .join('');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Tenant Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Profile Header */}
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xl font-semibold text-primary">
                                {initials}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">{tenant.name}</h3>
                            <p className="text-muted-foreground">
                                {unit?.number ?? '—'} • {property?.name ?? '—'}
                            </p>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="font-medium">{tenant.tel}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="font-medium text-sm truncate">{tenant.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Balance + Status */}
                    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                        <div>
                            <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                            <p className={cn(
                                "text-2xl font-bold",
                                tenantBalance > 0 ? "text-destructive" : "text-success"
                            )}>
                                {tenantBalance > 0 ? formatKES(tenantBalance) : 'Paid Up'}
                            </p>
                        </div>
                        <Badge
                            variant="outline"
                            className={statusStyles[tenant.status?.toLowerCase()] ?? ''}
                        >
                            {tenant.status}
                        </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message
                        </Button>
                        <Button className="flex-1">
                            View Payments
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}