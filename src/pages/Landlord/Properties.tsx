import { useState } from 'react';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatKES } from '@/lib/mock-data';
import { toast } from 'sonner';
import { Property } from '@/services/property.service';
import { House } from '@/services/house.service';
import { useProperties } from '@/hooks/useProperties';
import { useHouses } from '@/hooks/useHouses';
import { PropertyForm } from '@/components/forms/PropertyForm';
import { HouseForm } from '@/components/forms/HouseForm';
import { HouseDetailDialog } from '@/components/dialogs/HouseDetailDialog';

const statusStyles: Record<string, string> = {
  occupied: 'bg-success/10 text-success border-success/20',
  vacant: 'bg-muted text-muted-foreground border-border',
  maintenance: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function Properties() {
  const { properties, isLoading, addProperty } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { houses, isLoading: isHousesLoading, addHouse, updateHouse } = useHouses(
    selectedProperty?.id ?? null
  );

  const [propertyFormOpen, setPropertyFormOpen] = useState(false);
  const [unitFormOpen, setUnitFormOpen] = useState(false);
  const [unitDetailOpen, setUnitDetailOpen] = useState(false);

  const [selectedUnit, setSelectedUnit] = useState<House | null>(null);

  const handlePropertyCreated = (newProperty: Property) => {
    addProperty(newProperty);
    toast.success('Property added successfully!');
  };

  const handleUnitSaved = (savedHouse: House, isEdit: boolean) => {
    if (isEdit) {
      updateHouse(savedHouse);
      toast.success('Unit updated successfully!');
    } else {
      addHouse(savedHouse);
      toast.success('Unit created successfully!');
    }
  };

  const handleOpenEditUnit = (unit: House) => {
    setSelectedUnit(unit);
    setUnitFormOpen(true);
  };

  const handleOpenCreateUnit = () => {
    setSelectedUnit(null); 
    setUnitFormOpen(true);
  };

  const handleViewUnit = (unit: House) => {
    setSelectedUnit(unit);
    setUnitDetailOpen(true);
  };

  return (
    <DashboardLayout
      title="Properties & Units"
      description="Manage your property portfolio"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <Badge variant="secondary" className="text-sm">
          {properties.length} Properties
        </Badge>
        <Button onClick={() => setPropertyFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <p className="text-muted-foreground text-sm">Loading properties...</p>
      )}

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {properties.map((property) => (
          <div
            key={property.id}
            onClick={() => setSelectedProperty(property)}
            className={cn(
              "bg-card rounded-xl border border-border p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50",
              selectedProperty?.id === property.id && "ring-2 ring-primary border-primary"
            )}
          >
            <h3 className="font-semibold text-foreground">{property.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{property.address}</p>
          </div>
        ))}
      </div>

      {/* Units Section  */}
      {selectedProperty && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Units — {selectedProperty.name} &nbsp;
              <Badge variant="outline" className="text-sm">
                {houses.length} Total Units
              </Badge>
            </h2>
            <Button variant="outline" size="sm" onClick={handleOpenCreateUnit}>
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
            </Button>
          </div>

          {/* Loading State for Units */}
          {isHousesLoading && (
            <p className="text-muted-foreground text-sm">Loading units...</p>
          )}

          {/* Desktop Table */}
          {!isHousesLoading && (
            <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Unit</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Deposit</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Rent</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {houses.map((unit) => (
                    <tr key={unit.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{unit.number}</td>
                      <td className="p-4 text-muted-foreground">{unit.description}</td>
                      <td className="p-4">{formatKES(unit.deposit)}</td>
                      <td className="p-4">{formatKES(unit.rent)}</td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={statusStyles[unit.status?.toLowerCase() ?? 'vacant']}
                        >
                          {unit.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUnit(unit)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile Card View */}
          {!isHousesLoading && (
            <div className="md:hidden space-y-3">
              {houses.map((unit) => (
                <div
                  key={unit.id}
                  className="bg-card rounded-xl border border-border p-4 cursor-pointer"
                  onClick={() => handleViewUnit(unit)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-lg">{unit.number}</span>
                    <Badge
                      variant="outline"
                      className={statusStyles[unit.status?.toLowerCase() ?? 'vacant']}
                    >
                      {unit.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{unit.description}</span>
                    <span className="font-medium">{formatKES(unit.rent)}/mo</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <PropertyForm
        open={propertyFormOpen}
        onOpenChange={setPropertyFormOpen}
        onSuccess={handlePropertyCreated}
      />

      {selectedProperty && (
        <HouseForm
          open={unitFormOpen}
          onOpenChange={setUnitFormOpen}
          propertyId={selectedProperty.id}
          propertyName={selectedProperty.name}
          initialData={selectedUnit}
          onSuccess={handleUnitSaved}
        />
      )}

      <HouseDetailDialog
        open={unitDetailOpen}
        onOpenChange={setUnitDetailOpen}
        unit={selectedUnit}
        propertyName={selectedProperty?.name ?? ''}
        onEdit={handleOpenEditUnit}
      />

    </DashboardLayout>
  );
}
