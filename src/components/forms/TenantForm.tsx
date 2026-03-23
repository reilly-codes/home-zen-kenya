import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { tenantService, Tenant, CreateTenant } from "@/services/tenant.service";
import { Property } from "@/services/property.service";
import { House, houseService } from "@/services/house.service";

interface TenantFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    properties: Property[];
    onSuccess: (tenant: Tenant) => void;
}

const emptyForm: CreateTenant = {
    name: "",
    email: "",
    tel: "",
    national_id: "",
    hse: ""
}

export function TenantForm({
    open,
    onOpenChange,
    properties,
    onSuccess
}: TenantFormProps) {
    const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
    const [vacantUnits, setVacantUnits] = useState<House[]>([]);
    const [form, setForm] = useState<CreateTenant>(emptyForm);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        setForm(emptyForm);
        setSelectedProperty(null);
        setVacantUnits([]);
    }, [open]);

    useEffect(() => {
        if (!selectedProperty) return;
        const fetchUnits = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const units = await houseService.getAllByProperty(selectedProperty);
                const vacantHouses = units.filter(unit => unit.status === "VACANT");
                setVacantUnits(vacantHouses);
            } catch (err) {
                setError("Failed to get housing data.");
            } finally {
                setIsLoading(false)
            }
        };

        fetchUnits();
    }, [selectedProperty, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const newTenant = await tenantService.create(selectedProperty, form);
            onSuccess(newTenant);
            onOpenChange(false);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Could not create new tenant.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Tenant</DialogTitle>
                    <DialogDescription>
                        Create Tenant
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                                <Input
                                    id="tenant-name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. John Mbithi"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tenant-email">Email</Label>
                                <Input
                                    id="tenant-email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="e.g. jmbithi@email.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tenant-tel">Telephone Number</Label>
                                <Input
                                    id="tenant-tel"
                                    value={form.tel}
                                    onChange={(e) => setForm({ ...form, tel: e.target.value })}
                                    placeholder="e.g. 0712345678"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tenant-nat-id">National ID</Label>
                                <Input
                                    id="tenant-nat-id"
                                    value={form.national_id}
                                    onChange={(e) => setForm({ ...form, national_id: e.target.value })}
                                    placeholder="e.g. 34526514"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tenant-hse">House</Label>
                                <select name="tenant-hse"
                                    onChange={(e) => setForm({ ...form, hse: e.target.value })}
                                    value={form.hse}
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
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Adding...' : 'Add Tenant'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}