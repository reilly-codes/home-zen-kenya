import { useState } from 'react';
import { Wrench, Plus, AlertTriangle, Clock, CheckCircle2, User, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { maintenanceRequests, MaintenanceRequest } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const priorityStyles = {
  low: 'bg-muted text-muted-foreground border-border',
  medium: 'bg-primary/10 text-primary border-primary/20',
  high: 'bg-warning/10 text-warning border-warning/20',
  urgent: 'bg-destructive/10 text-destructive border-destructive/20',
};

const statusIcons = {
  new: AlertTriangle,
  'in-progress': Clock,
  completed: CheckCircle2,
};

const statusLabels = {
  new: 'New Request',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

export default function Maintenance() {
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);

  const groupedRequests = {
    new: maintenanceRequests.filter(r => r.status === 'new'),
    'in-progress': maintenanceRequests.filter(r => r.status === 'in-progress'),
    completed: maintenanceRequests.filter(r => r.status === 'completed'),
  };

  const handleNotifyLandlord = (request: MaintenanceRequest) => {
    toast.success('Notification sent!', {
      description: `Landlord has been notified about the ${request.priority} priority issue in ${request.unitNumber}.`,
    });
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Contractor assigned successfully!');
    setAssignOpen(false);
    setSelectedRequest(null);
  };

  const KanbanColumn = ({ status, requests }: { status: keyof typeof groupedRequests; requests: MaintenanceRequest[] }) => {
    const StatusIcon = statusIcons[status];
    const columnStyles = {
      new: 'border-t-warning',
      'in-progress': 'border-t-primary',
      completed: 'border-t-success',
    };

    return (
      <div className={cn(
        "bg-muted/30 rounded-xl p-4 border-t-4",
        columnStyles[status]
      )}>
        <div className="flex items-center gap-2 mb-4">
          <StatusIcon className={cn(
            "h-5 w-5",
            status === 'new' && "text-warning",
            status === 'in-progress' && "text-primary",
            status === 'completed' && "text-success"
          )} />
          <h3 className="font-semibold">{statusLabels[status]}</h3>
          <Badge variant="secondary" className="ml-auto">{requests.length}</Badge>
        </div>
        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="kanban-card"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className={priorityStyles[request.priority]}>
                  {request.priority}
                </Badge>
                <span className="text-xs text-muted-foreground">{request.createdAt}</span>
              </div>
              <p className="text-sm font-medium mb-2 line-clamp-2">{request.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{request.tenantName}</span>
                <span>•</span>
                <MapPin className="h-3 w-3" />
                <span>{request.unitNumber}</span>
              </div>
              {request.assignedTo && (
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Assigned to: <span className="font-medium text-foreground">{request.assignedTo}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
          {requests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No requests</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      title="Maintenance"
      description="Track and manage repair requests"
    >
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-warning/10 rounded-xl p-4 border border-warning/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span className="text-sm font-medium text-warning">New</span>
          </div>
          <p className="text-2xl font-bold">{groupedRequests.new.length}</p>
        </div>
        <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">In Progress</span>
          </div>
          <p className="text-2xl font-bold">{groupedRequests['in-progress'].length}</p>
        </div>
        <div className="bg-success/10 rounded-xl p-4 border border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span className="text-sm font-medium text-success">Completed</span>
          </div>
          <p className="text-2xl font-bold">{groupedRequests.completed.length}</p>
        </div>
      </div>

      {/* Kanban Board - Desktop */}
      <div className="hidden lg:grid grid-cols-3 gap-6">
        <KanbanColumn status="new" requests={groupedRequests.new} />
        <KanbanColumn status="in-progress" requests={groupedRequests['in-progress']} />
        <KanbanColumn status="completed" requests={groupedRequests.completed} />
      </div>

      {/* List View - Mobile/Tablet */}
      <div className="lg:hidden space-y-4">
        {Object.entries(groupedRequests).map(([status, requests]) => (
          <div key={status}>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              {(() => {
                const Icon = statusIcons[status as keyof typeof statusIcons];
                return <Icon className="h-4 w-4" />;
              })()}
              {statusLabels[status as keyof typeof statusLabels]}
              <Badge variant="secondary">{requests.length}</Badge>
            </h3>
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="mobile-card"
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className={priorityStyles[request.priority]}>
                      {request.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{request.createdAt}</span>
                  </div>
                  <p className="text-sm font-medium mb-2">{request.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{request.tenantName}</span>
                    <span>•</span>
                    <span>{request.unitNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Request Details Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedRequest && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={priorityStyles[selectedRequest.priority]}>
                    {selectedRequest.priority} priority
                  </Badge>
                </div>
                <DialogTitle className="text-lg mt-2">Maintenance Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="font-medium">{selectedRequest.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Tenant</p>
                    <p className="font-medium">{selectedRequest.tenantName}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Unit</p>
                    <p className="font-medium">{selectedRequest.unitNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                    <p className="font-medium">{selectedRequest.createdAt}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className="font-medium capitalize">{selectedRequest.status.replace('-', ' ')}</p>
                  </div>
                </div>

                {selectedRequest.assignedTo && (
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Assigned Contractor</p>
                    <p className="font-medium text-primary">{selectedRequest.assignedTo}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleNotifyLandlord(selectedRequest)}
                  >
                    Notify Landlord
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      setAssignOpen(true);
                    }}
                  >
                    Assign Contractor
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Contractor Modal */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Assign Contractor</DialogTitle>
            <DialogDescription>
              Select or add a contractor to handle this repair
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssign} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Contractor</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Select contractor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kamau">Kamau Hardware & Services</SelectItem>
                  <SelectItem value="coolair">CoolAir Kenya Ltd</SelectItem>
                  <SelectItem value="plumber">Nairobi Plumbing Works</SelectItem>
                  <SelectItem value="electrician">PowerFix Electricians</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" placeholder="Add any special instructions..." />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setAssignOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Assign
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
