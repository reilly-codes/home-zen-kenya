import { useEffect, useState, useMemo } from 'react';
import { Users, Plus, MessageSquare, Phone, Mail, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@radix-ui/react-select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatKES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/services/api';

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

interface tenantCreate {
  name: string,
  email: string,
  tel: string,
  role_id?: number,
  national_id: string | null,
  hse: string,
  status?: string
}

export default function Tenants() {
  const [searchQuery, setSearchQuery] = useState('');
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [viewTenantOpen, setViewTenantOpen] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [newTenant, setNewTenant] = useState<tenantCreate>({
    name: "",
    email: "",
    tel: "",
    national_id: "",
    hse: "",
  });
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [allTenants, setAllTenants] = useState([]);
  const [vacantUnits, setVacantUnits] = useState([]);
  const [allUnits, setAllUnits] = useState([]);
  const [addTenantsOpen, setAddTenantsOpen] = useState(false);
  const [rentInvoices, setRentInvoices] = useState([]);
  const [maintenanceInvoices, setMaintenanceInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnitsLoading, setIsUnitsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredTenants = allTenants.filter(tenant => {
    const query = searchQuery.toLowerCase();

    const matchName = tenant.name.toLowerCase().includes(query);

    const unit = allUnits.find(u => u.id === tenant.hse);

    const matchesUnit = unit?.number.toLowerCase().includes(query);

    return matchName || matchesUnit;
  });

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/properties/all");
        setProperties(response.data);
      } catch (err) {
        console.error("Failed to fetch Properties: ", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchtenants = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/tenants/all");
        setAllTenants(response.data);
      } catch (err) {
        console.error("Failed to fetch Tenants: ", err);
      } finally {
        setIsLoading(false);
      }
    }

    const fetchUnits = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/landlords/units/all");
        setAllUnits(response.data);
      } catch (err) {
        console.error("Failed to load all Landlord units", err);
      } finally {
        setIsLoading(false);
      }
    }

    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        try {
          const rentResponse = await api.get("/invoices/rent/all");
          setRentInvoices(rentResponse.data);
        } catch (err) {
          console.error("Failed to fetch rent invoices: ", err)
        }

        try {
          const response = await api.get("/invoices/maintenance/all");
          setMaintenanceInvoices(response.data);
        } catch(err) {
          console.error("Failed to fetch maintenance invoices: ", err);
        }
      }
      finally {
        setIsLoading(false);
      }
    }

    fetchProperties();
    fetchtenants();
    fetchUnits();
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (!selectedProperty) return;
    const fetchUnits = async () => {
      setIsUnitsLoading(true);
      try {
        const response = await api.get(`/properties/${selectedProperty}/houses/all`)
        const houses = response.data;
        const vacantHouses = [];
        houses.forEach(element => {
          if (element.status == "VACANT") {
            vacantHouses.push(element)
          }
        });
        setVacantUnits(vacantHouses);
      } catch (err) {
        console.error("Could not fetch vacant units : ", err);
      } finally {
        setIsUnitsLoading(false);
      }
    }

    fetchUnits();
  }, [selectedProperty]);

  const tenantBalances = useMemo(() => {
    const balances = {};
    rentInvoices.forEach(inv => {
      if(inv.status === "UNPAID" && inv.tenant_id && new Date(inv.date_due) > new Date()) {
        if(!balances[inv.tenant_id]) balances[inv.tenant_id] = 0;

        balances[inv.tenant_id] += Number(inv.amount || 0);
      }
    });

    maintenanceInvoices.forEach(bill => {
      if(bill.status !== "PAID" && bill.tenant_id) {
        if(!balances[bill.tenant_id]) balances[bill.tenant_id] = 0;

        balances[bill.tenant_id] += Number(bill.total_amount || 0);
      }
    });

    return balances;
  }, [rentInvoices, maintenanceInvoices]);

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

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newTenant) {
      setError("Fill in all fields");
      return;
    }

    try {
      const response = await api.post(`/tenants/create/properties/${selectedProperty}`, newTenant);
      toast.success("Tenant created successfully");
      setAllTenants((prevTenants) => [...prevTenants, response.data]);
      setNewTenant({
        name: "",
        email: "",
        tel: "",
        national_id: "",
        hse: "",
      });
      setAddTenantsOpen(false);
      setSelectedProperty(null);
    } catch (err) {
      const errMsg = err.response?.data?.detail || "Failed to save Unit";
      setError(errMsg);
    }

  };

  const tenant = selectedTenant ? allTenants.find(t => t.id === selectedTenant) : null;

  const tenantBalance = tenant ? (tenantBalances[tenant.id] || 0) : 0;

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
          <Button className="flex-1 sm:flex-initial" onClick={() => setAddTenantsOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Tenant
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{allTenants.length}</p>
          <p className="text-sm text-muted-foreground">Total Tenants</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-success">{allTenants.filter(t => t.status.toLowerCase() === 'active').length}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-warning">{allTenants.filter(t => t.status.toLowerCase() === 'moving_out').length}</p>
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
            {filteredTenants.map((tenant) => {
              const unit = allUnits.find(u => u.id === tenant.hse);
              const currentBalance = tenantBalances[tenant.id] || 0;
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
                    <p className="font-medium">{unit?.number}</p>
                    <p className="text-sm text-muted-foreground">{properties.find(p => p.id === unit.property_id)?.name}</p>
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
                    <Badge variant="outline" className={statusStyles[tenant.status.toLowerCase()]}>
                      {tenant.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setSelectedTenant(tenant.id);
                      setViewTenantOpen(true);
                    }}>
                      View
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredTenants.map((tenant) => {
          const unit = allUnits.find(u => u.id === tenant.hse);
          return (
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
                    <p className="text-sm text-muted-foreground">{unit?.number}</p>
                  </div>
                </div>
                <Badge variant="outline" className={statusStyles[tenant.status.toLowerCase()]}>
                  {tenant.status}
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
          )
        })}
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
                  {sendToAll ? `${allTenants.length} tenants will receive this message` : 'Select specific tenants below'}
                </p>
              </div>
              <Switch checked={sendToAll} onCheckedChange={setSendToAll} />
            </div>

            {/* Tenant Selection (if not sending to all) */}
            {!sendToAll && (
              <div className="space-y-2 max-h-40 overflow-y-auto p-4 border border-border rounded-lg">
                {allTenants.map((tenant) => (
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
                      {tenant.name} - {allUnits.find(u => u.id === tenant.hse)?.number}
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
      <Dialog open={viewTenantOpen} onOpenChange={setViewTenantOpen}>
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
                    <p className="text-muted-foreground">{allUnits.find(u => u.id === tenant.hse)?.number} • {properties.find(p => p.id === allUnits.find(u => u.id === tenant.hse)?.property_id)?.name}</p>
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

                {/* Balance */}
                <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      tenantBalance > 0 ? "text-destructive" : "text-success"
                    )}>
                      {tenantBalance > 0 ? formatKES(tenantBalance) : formatKES(tenantBalance)}
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

      {/* Create Tenant */}
      <Dialog open={addTenantsOpen} onOpenChange={setAddTenantsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Tenant</DialogTitle>
            <DialogDescription>
              Create Tenant
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTenant} className="space-y-4 mt-4">
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="property-select">Property</Label>

              <select name="property-select"
                onChange={(e) => setSelectedProperty(e.target.value)}
                value={selectedProperty || ""}
                className='w-full bg-background border border-input px-3 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-ring'>
                <option value="" disabled>Select Property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>{property.name}</option>
                ))}
              </select>
            </div>
            {selectedProperty && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tenant-name">Name</Label>
                  <Input id="tenant-name" value={newTenant.name} onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })} placeholder="e.g. John Mbithi" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenant-email">Email</Label>
                  <Input id="tenant-email" value={newTenant.email} onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })} placeholder="e.g. jmbithi@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenant-tel">Telephone Number</Label>
                  <Input id="tenant-tel" value={newTenant.tel} onChange={(e) => setNewTenant({ ...newTenant, tel: e.target.value })} placeholder="e.g. 0712345678" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenant-nat-id">National ID</Label>
                  <Input id="tenant-nat-id" value={newTenant.national_id} onChange={(e) => setNewTenant({ ...newTenant, national_id: e.target.value })} placeholder="e.g. 34526514" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenant-hse">House</Label>
                  <select name="tenant-hse"
                    onChange={(e) => setNewTenant({ ...newTenant, hse: e.target.value })}
                    value={newTenant.hse}
                    className='w-full bg-background border border-input px-3 py-2 rounded-md'>
                    <option value="" disabled>Select available unit</option>
                    {vacantUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>{unit.number}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setAddTenantsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Tenant</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
