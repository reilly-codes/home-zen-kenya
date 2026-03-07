import { useState, useEffect } from "react";
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    maintenanceRequestService,
    MaintenanceRequest,
    CreateMaintenanceRequest,
} from "@/services/maintenance-request.service";
import { propertyService, Property } from "@/services/property.service";
import { houseService, House } from "@/services/house.service";

interface MaintenanceRequestFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (request: MaintenanceRequest) => void;
}

const emptyForm = {
    hse_id: "",
    title: "",
    description: "",
};

export function MaintenanceRequestForm({
    open,
    onOpenChange,
    onSuccess,
}: MaintenanceRequestFormProps) {
    const [form, setForm] = useState(emptyForm);
    const [properties, setProperties] = useState<Property[]>([]);
    const [units, setUnits] = useState<House[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
    const [isLoadingProperties, setIsLoadingProperties] = useState(false);
    const [isLoadingUnits, setIsLoadingUnits] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            setForm(emptyForm);
            setProperties([]);
            setUnits([]);
            setSelectedProperty(null);
            setError(null);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const fetchProperties = async () => {
            setIsLoadingProperties(true);
            setError(null);
            try {
                const data = await propertyService.getAll();
                setProperties(data);
            } catch (err: any) {
                setError("Failed to load properties.");
            } finally {
                setIsLoadingProperties(false);
            }
        };

        fetchProperties();
    }, [open]);

    useEffect(() => {
        if (!selectedProperty) return;

        const fetchUnits = async () => {
            setIsLoadingUnits(true);
            setError(null);
            try {
                const data = await houseService.getAllByProperty(selectedProperty);
                setUnits(data);
            } catch (err: any) {
                setError("Failed to load units.");
            } finally {
                setIsLoadingUnits(false);
            }
        };

        fetchUnits();
    }, [selectedProperty]);

    const handlePropertyChange = (value: string) => {
        setSelectedProperty(value);
        setForm(prev => ({ ...prev, hse_id: "" }));
        setUnits([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const payload: CreateMaintenanceRequest = {
                hse_id: form.hse_id,
                title: form.title,
                description: form.description,
            };
            const newRequest = await maintenanceRequestService.create(payload);
            onSuccess(newRequest);
            onOpenChange(false);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to raise maintenance request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Raise Maintenance Request</DialogTitle>
                    <DialogDescription>
                        Create a repair request for a unit.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {error && (
                        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in slide-in-from-top-2 duration-300">
                            {error}
                        </div>
                    )}

                    {/* Property */}
                    <div className="space-y-2">
                        <Label>Property</Label>
                        {isLoadingProperties ? (
                            <p className="text-sm text-muted-foreground">
                                Loading properties...
                            </p>
                        ) : (
                            <Select
                                required
                                value={selectedProperty || ""}
                                onValueChange={handlePropertyChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Property" />
                                </SelectTrigger>
                                <SelectContent>
                                    {properties.map(p => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Unit */}
                    <div className="space-y-2">
                        <Label>Unit</Label>
                        {isLoadingUnits ? (
                            <p className="text-sm text-muted-foreground">
                                Loading units...
                            </p>
                        ) : (
                            <Select
                                required
                                value={form.hse_id}
                                onValueChange={(value) =>
                                    setForm(prev => ({ ...prev, hse_id: value }))
                                }
                                disabled={!selectedProperty}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.map(u => (
                                        <SelectItem key={u.id} value={u.id}>
                                            {u.number}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label>Issue Title</Label>
                        <Input
                            value={form.title}
                            onChange={(e) =>
                                setForm(prev => ({ ...prev, title: e.target.value }))
                            }
                            placeholder="e.g. Leaking Sink Repair"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={form.description}
                            onChange={(e) =>
                                setForm(prev => ({ ...prev, description: e.target.value }))
                            }
                            placeholder="Details about the maintenance work..."
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isSubmitting || !form.hse_id}
                        >
                            {isSubmitting ? "Submitting..." : "Raise Request"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}