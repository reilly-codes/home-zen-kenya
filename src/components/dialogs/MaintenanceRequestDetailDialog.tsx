import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MaintenanceRequest } from "@/services/maintenance-request.service";

interface MaintenanceRequestDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: MaintenanceRequest | null;
    onEditStatus: () => void;
}

export function MaintenanceRequestDetailDialog({
    open,
    onOpenChange,
    request,
    onEditStatus,
}: MaintenanceRequestDetailDialogProps) {
    if (!request) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <h3 className="text-lg font-bold mb-2">{request.title}</h3>
                    <DialogTitle className="text-lg mt-2">
                        Maintenance Request
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                            Description
                        </p>
                        <p className="font-medium">{request.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Tenant</p>
                            <p className="font-medium">
                                {request.tenant?.name ?? "Vacant"}
                            </p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Unit</p>
                            <p className="font-medium">{request.house.number}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">
                                Submitted
                            </p>
                            <p className="font-medium">
                                {format(new Date(request.date_raised), "MMM dd, yyyy")}
                            </p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                            <p className="font-medium capitalize">
                                {request.status.toLowerCase()}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => onOpenChange(false)}
                        >
                            Close
                        </Button>
                        <Button className="flex-1" onClick={onEditStatus}>
                            Edit Status
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}