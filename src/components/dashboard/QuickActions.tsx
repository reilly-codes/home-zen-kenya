import { UserPlus, Receipt, MessageSquare, FileUp } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface QuickAction {
  icon: React.ElementType;
  label: string;
  description: string;
  action: () => void;
}

export function QuickActions() {
  const [addTenantOpen, setAddTenantOpen] = useState(false);
  const [logPaymentOpen, setLogPaymentOpen] = useState(false);

  const actions: QuickAction[] = [
    {
      icon: UserPlus,
      label: 'Add New Tenant',
      description: 'Register a new tenant',
      action: () => setAddTenantOpen(true),
    },
    {
      icon: Receipt,
      label: 'Log Payment',
      description: 'Record a new payment',
      action: () => setLogPaymentOpen(true),
    },
    {
      icon: MessageSquare,
      label: 'Send Broadcast',
      description: 'Message all tenants',
      action: () => toast.info('Opening broadcast modal...'),
    },
    {
      icon: FileUp,
      label: 'Upload Statement',
      description: 'Bank reconciliation',
      action: () => toast.info('Opening upload modal...'),
    },
  ];

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Tenant added successfully!');
    setAddTenantOpen(false);
  };

  const handleLogPayment = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Payment logged successfully!');
    setLogPaymentOpen(false);
  };

  return (
    <>
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">Frequently used operations</p>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className="quick-action-btn text-left"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <action.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
              <span className="text-xs text-muted-foreground text-center">{action.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Tenant Modal */}
      <Dialog open={addTenantOpen} onOpenChange={setAddTenantOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Tenant</DialogTitle>
            <DialogDescription>
              Enter the tenant details to register them in the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTenant} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-name">Full Name</Label>
              <Input id="tenant-name" placeholder="e.g. James Mwangi" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-phone">Phone Number</Label>
              <Input id="tenant-phone" placeholder="+254 7XX XXX XXX" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-email">Email Address</Label>
              <Input id="tenant-email" type="email" placeholder="email@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-unit">Assign Unit</Label>
              <Input id="tenant-unit" placeholder="e.g. A103" required />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setAddTenantOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Tenant</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Log Payment Modal */}
      <Dialog open={logPaymentOpen} onOpenChange={setLogPaymentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Log Payment</DialogTitle>
            <DialogDescription>
              Record a new payment from a tenant.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogPayment} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="payment-tenant">Tenant</Label>
              <Input id="payment-tenant" placeholder="Search tenant name..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Amount (KES)</Label>
              <Input id="payment-amount" type="number" placeholder="45000" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Input id="payment-method" placeholder="M-Pesa / Bank Transfer" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-ref">Reference Number</Label>
              <Input id="payment-ref" placeholder="e.g. MPESA1234567" required />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setLogPaymentOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Log Payment</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
