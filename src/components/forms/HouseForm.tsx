// components/forms/UnitForm.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { houseService, House, SaveHouseDTO } from '@/services/house.service';

interface UnitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyName: string;          // for the dialog title
  initialData?: House | null;    // present = edit mode, absent = create mode
  onSuccess: (house: House, isEdit: boolean) => void;
}

const emptyForm: SaveHouseDTO = {
  number: '',
  rent: 0,
  deposit: 0,
  description: '',
};

export function HouseForm({
  open,
  onOpenChange,
  propertyId,
  propertyName,
  initialData,
  onSuccess,
}: UnitFormProps) {
  const [form, setForm] = useState<SaveHouseDTO>(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When initialData changes (switching between create/edit), update the form
  useEffect(() => {
    if (initialData) {
      setForm({
        number: initialData.number,
        rent: initialData.rent,
        deposit: initialData.deposit,
        description: initialData.description,
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData, open]); // also reset when dialog opens/closes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [id]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let savedHouse: House;
      const isEdit = !!initialData?.id;

      if (isEdit) {
        savedHouse = await houseService.update(propertyId, initialData!.id!, form);
      } else {
        savedHouse = await houseService.create(propertyId, form);
      }

      onSuccess(savedHouse, isEdit);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save unit.");
    } finally {
      setIsLoading(false);
    }
  };

  const isEdit = !!initialData?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit Unit ${initialData?.number}` : `Add Unit to ${propertyName}`}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the unit details below.' : 'Enter unit details to add it to this property.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="number">Unit Number</Label>
            <Input
              id="number"
              value={form.number}
              onChange={handleChange}
              placeholder="e.g. A101"
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deposit">Deposit (KES)</Label>
            <Input
              id="deposit"
              type="number"
              value={form.deposit}
              onChange={handleChange}
              placeholder="e.g. 6500"
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rent">Rent (KES)</Label>
            <Input
              id="rent"
              type="number"
              value={form.rent}
              onChange={handleChange}
              placeholder="e.g. 12000"
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={form.description}
              onChange={handleChange}
              placeholder="e.g. 2 Bedroom Apartment"
              disabled={isLoading}
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Unit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}