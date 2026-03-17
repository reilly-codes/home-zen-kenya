import { useState, useEffect } from "react";
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { invoiceService, Invoice, SaveInvoice } from "@/services/rentinvoice.service";
import { Property } from "@/services/property.service";
import { House, houseService } from "@/services/house.service";

interface RentInvoiceFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    properties: Property[];
    onSuccess: (invoice: Invoice) => void;
}

const defaultUtilities = [
    { bill_type: "WATER", amount: 0 },
    { bill_type: "ELECTRICITY", amount: 0 },
];

const emptyForm: SaveInvoice = {
    utilities: [{ bill_type: "", amount: 0 }]
};

export function RentInvoiceForm({
    open,
    onOpenChange,
    properties,
    onSuccess,
}: RentInvoiceFormProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const [occupiedUnits, setOccupiedUnits] = useState<House[]>([]);
    const [utilities, setUtilities] = useState(defaultUtilities);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            setStep(1);
            setSelectedProperty(null);
            setSelectedUnit(null);
            setOccupiedUnits([]);
            setUtilities(defaultUtilities);
            setError(null);
        }
    }, [open]);

    useEffect(() => {
        if (!selectedProperty) return;

        const fetchUnits = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const units = await houseService.getAllByProperty(selectedProperty);
                setOccupiedUnits(units.filter(u => u.status === "OCCUPIED"));
            } catch (err) {
                setError("Failed to load units.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUnits();
    }, [selectedProperty]);

    const handleUtilityChange = (index: number, field: 'bill_type' | 'amount', value: string | number) => {
        setUtilities(prev => prev.map((u, i) =>
            i === index ? { ...u, [field]: value } : u
        ));
    };

    const addUtilityRow = () => {
        setUtilities(prev => [...prev, { bill_type: "OTHER", amount: 0 }]);
    };

    const removeUtilityRow = (index: number) => {
        if (utilities.length === 1) return;
        setUtilities(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const payload: SaveInvoice = { utilities };
            const newInvoice = await invoiceService.create(selectedUnit!, payload);
            onSuccess(newInvoice);
            onOpenChange(false);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Could not generate rent invoice.");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedUnitData = occupiedUnits.find(u => u.id === selectedUnit);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Generate Rent Invoice</DialogTitle>
                    <DialogDescription>
                        {step === 1
                            ? "Select the property and unit to invoice."
                            : `Adding utilities for Unit ${selectedUnitData?.number}`
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
                                <Label>Occupied Unit</Label>
                                {isLoading ? (
                                    <p className="text-sm text-muted-foreground">Loading units...</p>
                                ) : occupiedUnits.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No occupied units in this property.
                                    </p>
                                ) : (
                                    <select
                                        value={selectedUnit || ""}
                                        onChange={(e) => setSelectedUnit(e.target.value)}
                                        className="w-full bg-background border border-input px-3 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="" disabled>Select unit</option>
                                        {occupiedUnits.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.number} — KES {u.rent.toLocaleString()}/mo
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
                                Next — Add Utilities
                            </Button>
                        </div>
                    </div>
                )}

                {/* ===== STEP 2 — Add Utility Bills ===== */}
                {step === 2 && (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        {/* Unit summary */}
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium">
                                    Unit {selectedUnitData?.number}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Base rent: KES {selectedUnitData?.rent.toLocaleString()}
                                </p>
                            </div>
                            <Badge variant="outline">Occupied</Badge>
                        </div>

                        {/* Utility rows */}
                        <div className="space-y-3">
                            <Label>Utility Bills</Label>
                            {utilities.map((utility, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        placeholder="e.g. WATER"
                                        value={utility.bill_type}
                                        onChange={(e) =>
                                            handleUtilityChange(index, 'bill_type', e.target.value)
                                        }
                                        className="flex-1"
                                        required
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Amount"
                                        value={utility.amount}
                                        onChange={(e) =>
                                            handleUtilityChange(index, 'amount', Number(e.target.value))
                                        }
                                        className="w-32"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeUtilityRow(index)}
                                        disabled={utilities.length === 1}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addUtilityRow}
                                className="w-full"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Utility
                            </Button>
                        </div>

                        <DialogFooter className="gap-2 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep(1)}
                            >
                                Back
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Generating...' : 'Generate Invoice'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}