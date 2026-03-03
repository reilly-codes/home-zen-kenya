// components/forms/UnitDetailDialog.tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';
import { House } from '@/services/house.service';
import { formatKES } from '@/lib/mock-data';

const statusStyles: Record<string, string> = {
  occupied: 'bg-success/10 text-success border-success/20',
  vacant: 'bg-muted text-muted-foreground border-border',
  maintenance: 'bg-destructive/10 text-destructive border-destructive/20',
};

interface HouseDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: House | null;
  propertyName: string;
  onEdit: (unit: House) => void; // tells the page to open the edit form
}

export function HouseDetailDialog({
  open,
  onOpenChange,
  unit,
  propertyName,
  onEdit,
}: HouseDetailDialogProps) {
  if (!unit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              {propertyName}
            </div>
          </DialogTitle>
          <hr />
          <DialogDescription>
            Unit {unit.number} details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Unit Number</label>
              <p className="font-medium">{unit.number}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <br />
              <Badge
                variant="outline"
                className={statusStyles[unit.status?.toLowerCase() ?? 'vacant']}
              >
                {unit.status}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Rent</label>
              <p>{formatKES(unit.rent)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Deposit</label>
              <p>{formatKES(unit.deposit)}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="text-sm text-muted-foreground">{unit.description}</p>
          </div>
          <hr />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={() => {
              onOpenChange(false); // close view dialog first
              onEdit(unit);        // then open edit form
            }}>
              Edit Unit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}