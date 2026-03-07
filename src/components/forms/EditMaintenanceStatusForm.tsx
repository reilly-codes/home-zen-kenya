import { useState, useEffect } from "react";
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    maintenanceRequestService,
    MaintenanceRequest,
} from "@/services/maintenance-request.service";

const REPAIR_STATUSES = [
    { value: "PENDING", label: "Pending" },
    { value: "IN PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
] as const;

interface EditMaintenanceStatusFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: MaintenanceRequest | null;
    onSuccess: (updated: MaintenanceRequest) => void;
}

export function EditMaintenanceStatusForm({
    open,
    onOpenChange,
    request,
    onSuccess,
}: EditMaintenanceStatusFormProps) {
    const [status, setStatus] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && request) {
            setStatus(request.status);
        }
        if (!open) {
            setStatus("");
            setError(null);
        }
    }, [open, request]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!request) return;

        setError(null);
        setIsSubmitting(true);

        try {
            const updated = await maintenanceRequestService.updateStatus(
                request.id,
                { status }
            );
            onSuccess(updated);
            onOpenChange(false);
        } catch (err: any) {
            setError(
                err.response?.data?.detail || "Failed to update status."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Edit Repair Status</DialogTitle>
                    <DialogDescription>
                        {request?.title
                            ? `Update the status for: ${request.title}`
                            : "Update the status of this repair request."
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {error && (
                        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in slide-in-from-top-2 duration-300">
                            {error}
                        </div>
                    )}

                    {/* Current request summary */}
                    {request && (
                        <div className="p-3 bg-muted/50 rounded-lg text-sm">
                            <p className="font-medium">{request.title}</p>
                            <p className="text-muted-foreground text-xs mt-1">
                                Unit {request.house.number}
                                {request.tenant?.name
                                    ? ` · ${request.tenant.name}`
                                    : " · Vacant"
                                }
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Repair Status</Label>
                        <Select
                            required
                            value={status}
                            onValueChange={setStatus}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {REPAIR_STATUSES.map(s => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                            disabled={isSubmitting || !status}
                        >
                            {isSubmitting ? "Saving..." : "Update Status"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}