import { useState } from 'react';
import { Users, Plus, MessageSquare, Phone, Mail, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { tenants, formatKES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusStyles = {
  active: 'bg-success/10 text-success border-success/20',
  'moving-out': 'bg-warning/10 text-warning border-warning/20',
  pending: 'bg-muted text-muted-foreground border-border',
};

const statusLabels = {
  active: 'Active',
  'moving-out': 'Moving Out',
  pending: 'Pending',
};

export default function Tenants() {
  const [searchQuery, setSearchQuery] = useState('');
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.unitNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const channels = [];
    if (smsEnabled) channels.push('SMS');
    if (whatsappEnabled) channels.push('WhatsApp');
    
    toast.success(`Broadcast sent via ${channels.join(' and ')}!`, {
      description: sendToAll ? 'Message sent to all tenants' : `Message sent to ${selectedTenants.length} selected tenants`,
    });
    setBroadcastOpen(false);
  };

  const tenant = selectedTenant ? tenants.find(t => t.id === selectedTenant) : null;

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
            placeholder="Search tenants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setBroadcastOpen(true)} className="flex-1 sm:flex-initial">
            <MessageSquare className="mr-2 h-4 w-4" />
            Broadcast
          </Button>
          <Button className="flex-1 sm:flex-initial">
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
          <p className="text-2xl font-bold text-success">{tenants.filter(t => t.status === 'active').length}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-warning">{tenants.filter(t => t.status === 'moving-out').length}</p>
          <p className="text-sm text-muted-foreground">Moving Out</p>
        </div>
      </div>

      {/* Desktop Table View */}
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
            {filteredTenants.map((tenant) => (
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
                  <p className="font-medium">{tenant.unitNumber}</p>
                  <p className="text-sm text-muted-foreground">{tenant.propertyName}</p>
                </td>
                <td className="p-4 text-muted-foreground">{tenant.phone}</td>
                <td className="p-4">
                  <span className={cn(
                    "font-medium",
                    tenant.balance > 0 ? "text-destructive" : "text-success"
                  )}>
                    {tenant.balance > 0 ? formatKES(tenant.balance) : 'Paid'}
                  </span>
                </td>
                <td className="p-4">
                  <Badge variant="outline" className={statusStyles[tenant.status]}>
                    {statusLabels[tenant.status]}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTenant(tenant.id)}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredTenants.map((tenant) => (
          <div 
            key={tenant.id} 
            className="mobile-card"
            onClick={() => setSelectedTenant(tenant.id)}
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
                  <p className="text-sm text-muted-foreground">{tenant.unitNumber}</p>
                </div>
              </div>
              <Badge variant="outline" className={statusStyles[tenant.status]}>
                {statusLabels[tenant.status]}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
              <span className="text-muted-foreground">{tenant.phone}</span>
              <span className={cn(
                "font-medium",
                tenant.balance > 0 ? "text-destructive" : "text-success"
              )}>
                {tenant.balance > 0 ? formatKES(tenant.balance) : 'Paid'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Modal */}
      <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Broadcast Message</DialogTitle>
            <DialogDescription>
              Send a message to your tenants via SMS or WhatsApp
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBroadcast} className="space-y-4 mt-4">
            {/* Recipients Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Send to All Tenants</p>
                <p className="text-sm text-muted-foreground">
                  {sendToAll ? `${tenants.length} tenants will receive this message` : 'Select specific tenants below'}
                </p>
              </div>
              <Switch checked={sendToAll} onCheckedChange={setSendToAll} />
            </div>

            {/* Tenant Selection (if not sending to all) */}
            {!sendToAll && (
              <div className="space-y-2 max-h-40 overflow-y-auto p-4 border border-border rounded-lg">
                {tenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center gap-3">
                    <Checkbox
                      id={tenant.id}
                      checked={selectedTenants.includes(tenant.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTenants([...selectedTenants, tenant.id]);
                        } else {
                          setSelectedTenants(selectedTenants.filter(id => id !== tenant.id));
                        }
                      }}
                    />
                    <Label htmlFor={tenant.id} className="flex-1 cursor-pointer">
                      {tenant.name} - {tenant.unitNumber}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                className="min-h-[120px]"
                required
              />
            </div>

            {/* Channel Selection */}
            <div className="space-y-3">
              <Label>Send via:</Label>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="sms"
                    checked={smsEnabled}
                    onCheckedChange={(checked) => setSmsEnabled(!!checked)}
                  />
                  <Label htmlFor="sms" className="cursor-pointer">SMS</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="whatsapp"
                    checked={whatsappEnabled}
                    onCheckedChange={(checked) => setWhatsappEnabled(!!checked)}
                  />
                  <Label htmlFor="whatsapp" className="cursor-pointer">WhatsApp</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setBroadcastOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!smsEnabled && !whatsappEnabled}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Broadcast
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tenant Details Modal */}
      <Dialog open={!!selectedTenant} onOpenChange={() => setSelectedTenant(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {tenant && (
            <>
              <DialogHeader>
                <DialogTitle>Tenant Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-semibold text-primary">
                      {tenant.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{tenant.name}</h3>
                    <p className="text-muted-foreground">{tenant.unitNumber} • {tenant.propertyName}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{tenant.phone}</p>
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

                {/* Lease Info */}
                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium">Lease Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">{tenant.leaseStart}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <p className="font-medium">{tenant.leaseEnd}</p>
                    </div>
                  </div>
                </div>

                {/* Balance */}
                <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      tenant.balance > 0 ? "text-destructive" : "text-success"
                    )}>
                      {tenant.balance > 0 ? formatKES(tenant.balance) : 'Paid Up'}
                    </p>
                  </div>
                  <Badge variant="outline" className={statusStyles[tenant.status]}>
                    {statusLabels[tenant.status]}
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
