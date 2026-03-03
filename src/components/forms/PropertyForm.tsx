// components/forms/PropertyForm.tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { propertyService, Property } from '@/services/property.service';

interface PropertyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newProperty: Property) => void; // tells the page a property was created
}

export function PropertyForm({ open, onOpenChange, onSuccess }: PropertyFormProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !address) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const data = { name, address };
      const newProperty = await propertyService.create(data);

      // Tell the parent a property was created — parent decides what to do next
      onSuccess(newProperty);

      // Reset form and close
      setName('');
      setAddress('');
      onOpenChange(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to add property.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>
            Enter the property details to add it to your portfolio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="property-name">Property Name</Label>
            <Input
              id="property-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Westlands View Apartments"
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="property-address">Location</Label>
            <Input
              id="property-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Westlands, Nairobi"
              disabled={isLoading}
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Property'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}