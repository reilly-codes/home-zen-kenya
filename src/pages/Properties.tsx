import { useState } from 'react';
import { Building2, Plus, MapPin, Users, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { properties, units, formatKES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusStyles = {
  occupied: 'bg-success/10 text-success border-success/20',
  vacant: 'bg-muted text-muted-foreground border-border',
  maintenance: 'bg-destructive/10 text-destructive border-destructive/20',
};

const statusLabels = {
  occupied: 'Occupied',
  vacant: 'Vacant',
  maintenance: 'Maintenance',
};

export default function Properties() {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Property added successfully!');
    setAddPropertyOpen(false);
  };

  const propertyUnits = selectedProperty
    ? units.filter(u => u.propertyId === selectedProperty)
    : [];

  return (
    <DashboardLayout
      title="Properties & Units"
      description="Manage your property portfolio"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {properties.length} Properties
          </Badge>
          <Badge variant="outline" className="text-sm">
            {properties.reduce((acc, p) => acc + p.totalUnits, 0)} Total Units
          </Badge>
        </div>
        <Button onClick={() => setAddPropertyOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {properties.map((property) => (
          <div
            key={property.id}
            onClick={() => setSelectedProperty(property.id)}
            className={cn(
              "bg-card rounded-xl border border-border p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50",
              selectedProperty === property.id && "ring-2 ring-primary border-primary"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <ChevronRight className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                selectedProperty === property.id && "rotate-90 text-primary"
              )} />
            </div>
            <h3 className="font-semibold text-lg mb-1">{property.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
              <MapPin className="h-3 w-3" />
              {property.location}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{property.occupiedUnits}/{property.totalUnits} units</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary">{formatKES(property.monthlyRevenue)}</p>
                <p className="text-xs text-muted-foreground">monthly</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Units Section */}
      {selectedProperty && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Units - {properties.find(p => p.id === selectedProperty)?.name}
            </h2>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
            </Button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Unit</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Rent</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {propertyUnits.map((unit) => (
                  <tr key={unit.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">{unit.unitNumber}</td>
                    <td className="p-4 text-muted-foreground">{unit.type}</td>
                    <td className="p-4">{formatKES(unit.rent)}</td>
                    <td className="p-4">
                      <Badge variant="outline" className={statusStyles[unit.status]}>
                        {statusLabels[unit.status]}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {propertyUnits.map((unit) => (
              <div key={unit.id} className="mobile-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-lg">{unit.unitNumber}</span>
                  <Badge variant="outline" className={statusStyles[unit.status]}>
                    {statusLabels[unit.status]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{unit.type}</span>
                  <span className="font-medium">{formatKES(unit.rent)}/mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Property Modal */}
      <Dialog open={addPropertyOpen} onOpenChange={setAddPropertyOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>
              Enter the property details to add it to your portfolio.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProperty} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="property-name">Property Name</Label>
              <Input id="property-name" placeholder="e.g. Westlands View Apartments" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="property-location">Location</Label>
              <Input id="property-location" placeholder="e.g. Westlands, Nairobi" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property-units">Number of Units</Label>
                <Input id="property-units" type="number" placeholder="12" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property-type">Property Type</Label>
                <Input id="property-type" placeholder="Apartments" required />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setAddPropertyOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Property</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
