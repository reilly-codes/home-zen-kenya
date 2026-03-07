// components/forms/MaintenanceInvoiceForm.tsx
import { useState, useEffect } from "react";
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { maintenanceService, MaintenanceInvoice, CreateMaintenanceInvoice } from "@/services/maintenanceinvoice.service";
import { Property } from "@/services/property.service";
import { House, houseService } from "@/services/house.service";

interface MaintenanceInvoiceFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    properties: Property[];
    onSuccess: (invoice: MaintenanceInvoice) => void;
}

const emptyForm = {
    title: "",
    description: "",
    labor_cost: 0,
    parts_cost: 0,
};

export function MaintenanceInvoiceForm({
    open,
    onOpenChange,
    properties,
    onSuccess,
}: MaintenanceInvoiceFormProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const [allUnits, setAllUnits] = useState<House[]>([]);
    const [form, setForm] = useState(emptyForm);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset everything when dialog closes
    useEffect(() => {
        if (!open) {
            setStep(1);
            setSelectedProperty(null);
            setSelectedUnit(null);
            setAllUnits([]);
            setForm(emptyForm);
            setError(null);
        }
    }, [open]);

    // Fetch ALL units for the property — not just occupied
    // Maintenance can be raised for any unit regardless of occupancy
    useEffect(() => {
        if (!selectedProperty) return;

        const fetchUnits = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const units = await houseService.getAllByProperty(selectedProperty);
                setAllUnits(units);
            } catch (err) {
                setError("Failed to load units.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUnits();
    }, [selectedProperty]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { id, value, type } = e.target as HTMLInputElement;
        setForm(prev => ({
            ...prev,
            [id]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedUnit || !form.title) {
            setError("Please select a unit and fill in the title.");
            return;
        }

        setIsLoading(true);
        try {
            const payload: CreateMaintenanceInvoice = {
                hse_id: selectedUnit,
                ...form,
            };
            const newInvoice = await maintenanceService.create(payload);
            onSuccess(newInvoice);
            onOpenChange(false);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Could not create maintenance bill.");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedUnitData = allUnits.find(u => u.id === selectedUnit);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Maintenance Bill</DialogTitle>
                    <DialogDescription>
                        {step === 1
                            ? "Select the property and unit that needs maintenance."
                            : `Adding repair details for Unit ${selectedUnitData?.number}`
                        }
                    </DialogDescription>
                </DialogHeader>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-2">
                    <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in slide-in-from-top-2 duration-300">
                        {error}
                    </div>
                )}

                {/* ===== STEP 1 — Select Property & Unit ===== */}
                {step === 1 && (
                    <div className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label>Property</Label>
                            <select
                                value={selectedProperty || ""}
                                onChange={(e) => {
                                    setSelectedProperty(e.target.value);
                                    setSelectedUnit(null);
                                }}
                                className="w-full bg-background border border-input px-3 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-ring"
                            >
                                <option value="" disabled>Select property</option>
                                {properties.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedProperty && (
                            <div className="space-y-2">
                                <Label>Unit</Label>
                                {isLoading ? (
                                    <p className="text-sm text-muted-foreground">
                                        Loading units...
                                    </p>
                                ) : allUnits.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No units found in this property.
                                    </p>
                                ) : (
                                    <select
                                        value={selectedUnit || ""}
                                        onChange={(e) => setSelectedUnit(e.target.value)}
                                        className="w-full bg-background border border-input px-3 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="" disabled>Select unit</option>
                                        {allUnits.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.number} — {u.status}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                disabled={!selectedUnit}
                                onClick={() => setStep(2)}
                            >
                                Next — Repair Details
                            </Button>
                        </div>
                    </div>
                )}

                {/* ===== STEP 2 — Repair Details ===== */}
                {step === 2 && (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        {/* Unit summary */}
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium">
                                Unit {selectedUnitData?.number}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                                Status: {selectedUnitData?.status?.toLowerCase()}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Repair Title</Label>
                            <Input
                                id="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="e.g. Broken pipe in bathroom"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Describe the repair needed..."
                                className="min-h-[80px]"
                            />
                        </div>

                        {/* Costs — optional at creation, can be updated later */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="labor_cost">Labour Cost (KES)</Label>
                                <Input
                                    id="labor_cost"
                                    type="number"
                                    value={form.labor_cost}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="parts_cost">Parts Cost (KES)</Label>
                                <Input
                                    id="parts_cost"
                                    type="number"
                                    value={form.parts_cost}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Costs can be left as 0 and updated once the repair is complete.
                        </p>

                        <DialogFooter className="gap-2 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep(1)}
                            >
                                Back
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Creating...' : 'Create Bill'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}