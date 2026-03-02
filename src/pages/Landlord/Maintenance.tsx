import { useState, useEffect } from 'react';
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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { format } from 'date-fns';
import { units } from '@/lib/mock-data';


const repairStatuses = {
  "PENDING": "PENDING",
  "IN PROGRESS": "IN PROGRESS",
  "COMPLETED": "COMPLETED"
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

interface MaintenanceRequest {
  id: string,
  title: string,
  description: string,
  date_raised: Date,
  status: string,
  tenant: {
    name: string,
  },
  house: {
    number: string
  }
}

export default function Maintenance() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [maintenanceIssues, setMaintenanceIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editRepair, setEditRepair] = useState({
    status: ""
  });
  const [newRepair, setNewRepair] = useState({
    hse_id: "",
    title: "",
    description: ""
  });
  const [allProperties, setAllProperties] = useState([]);
  const [allUnits, setAllUnits] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [addRepairOpen, setAddRepairOpen] = useState(false);

  useEffect(() => {
    const fetchMaintenance = async () => {
      setIsLoading(true)
      try {
        const response = await api.get("/maintenance/all");
        setMaintenanceIssues(response.data);
        console.log(maintenanceIssues);
      } catch (err) {
        console.error("Could not fetch maintenance issues: ", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaintenance();
  }, []);

  const groupedRequests = {
    new: maintenanceIssues.filter(r => r.status.toLowerCase() === 'pending'),
    'in-progress': maintenanceIssues.filter(r => r.status.toLowerCase() === 'in progress'),
    completed: maintenanceIssues.filter(r => r.status.toLowerCase() === 'completed'),
  };

  useEffect(() => {
    const fetchProperties = async () => {
      if (addRepairOpen) {
        setIsLoading(true);
        try {
          const res = await api.get("/properties/all");
          setAllProperties(res.data);
        } catch (err) {
          const errMsg = err.response?.data?.detail || "Failed to fetch properties";
          setError(errMsg);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProperties();
  }, [addRepairOpen]);

  useEffect(() => {
    const fetchUnits = async () => {
      if (!selectedProperty) return;

      setIsLoading(true);
      try {
        const response = await api.get(`/properties/${selectedProperty}/houses/all`)
        setAllUnits(response.data);
      } catch (err) {
        const errMsg = err.response?.data?.detail || "Failed to fetch property Units";
        setError(errMsg);
      }
      finally {
        setIsLoading(false);
      }
    };

    fetchUnits();
  }, [selectedProperty]);

  const handleAddRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await api.post("/maintenance/generate", newRepair);
      toast.success("Raised Maintenance Request successfully")
      setMaintenanceIssues((prevRequests) => [...prevRequests, response.data])
      setNewRepair({
        hse_id: "",
        title: "",
        description: ""
      });
      setSelectedProperty(null);
    } catch (err) {
      const errMsg = err.response?.data?.detail || "Failed to raise maintenance Request";
      setError(errMsg);
      toast.error("Request Failed")
    }
  };

  const handleEditStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await api.patch(`/maintenance/edit-status/${selectedRequest.id}`, editRepair)
      toast.success('Status changed successfully!');
      setMaintenanceIssues((prevRepairs) => prevRepairs.map((repair) =>
        repair.id === response.data.id ? response.data : repair
      ));
      setEditRepair({
        status: ""
      });
      setEditOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      const errMsg = err.response?.data?.detail || "Failed to change Request status";
      setError(errMsg);
    }


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
                <h3 className='text-lg font-bold mb-2'>{request.title}</h3>
                <span className="text-xs text-muted-foreground">{format(new Date(request.date_raised), "MMM dd, yyyy")}</span>
              </div>
              <p className="text-sm font-medium mb-2 line-clamp-2">{request.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{request.tenant?.name || "VACANT"}</span>
                <span>•</span>
                <MapPin className="h-3 w-3" />
                <span>{request.house.number}</span>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="empty-state py-12">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-primary/5 rounded-full scale-150 blur-xl" />
                <Wrench className="h-12 w-12 text-muted-foreground/40 relative" />
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">All clear! ✨</h3>
              <p className="text-xs text-muted-foreground/70">No requests in this category</p>
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

      <div className='flex justify-end mb-3'>
        <div className="max-w-sm">
          <Button
            className="flex-1"
            onClick={() => {
              setAddRepairOpen(true);
            }}
          >
            Raise Maintenance Request
          </Button>
        </div>
      </div>

      <hr />


      {/* Kanban Board - Desktop */}
      <div className="hidden lg:grid grid-cols-3 gap-6 mt-3">
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

                    <span className="text-xs text-muted-foreground">{format(new Date(request.date_raised), "MMM dd, yyyy")}</span>
                  </div>
                  <h3 className='text-lg font-bold mb-2'>{request.title}</h3>
                  <p className="text-sm font-normal mb-2">{request.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{request.tenant?.name || "VACANT"}</span>
                    <span>•</span>
                    <span>{request.house.number}</span>
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
                  <h3 className='text-lg font-bold mb-2'>{selectedRequest.title}</h3>
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
                    <p className="font-medium">{selectedRequest.tenant?.name || "VACANT"}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Unit</p>
                    <p className="font-medium">{selectedRequest.house.number}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                    <p className="font-medium">{format(new Date(selectedRequest.date_raised), "MMM dd, yyyy")}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className="font-medium capitalize">{selectedRequest.status.replace('-', ' ')}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {/* <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleNotifyLandlord(selectedRequest)}
                  >
                    Notify Landlord
                  </Button> */}
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setEditOpen(true);
                    }}
                  >
                    Edit Status
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addRepairOpen} onOpenChange={setAddRepairOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Raise Maintenance Issue</DialogTitle>
            <DialogDescription>
              Create Repair request
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddRepair} className='space-y-4 mt-5'>
            <div className="space-y-2">
              <Label>Property</Label>
              <Select required value={selectedProperty || ""} onValueChange={(value) => setSelectedProperty(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Property" />
                </SelectTrigger>
                <SelectContent>
                  {allProperties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>{property.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>House</Label>
              <Select required value={newRepair.hse_id || ""} onValueChange={(value) => setNewRepair({ ...newRepair, hse_id: value })} disabled={!selectedProperty || isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Property Unit" />
                </SelectTrigger>
                <SelectContent>
                  {
                    allUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>{unit.number}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Issue Title</Label>
              <Input
                value={newRepair.title}
                onChange={(e) => setNewRepair({ ...newRepair, title: e.target.value })}
                placeholder="e.g., Leaking Sink Repair"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newRepair.description}
                onChange={(e) => setNewRepair({ ...newRepair, description: e.target.value })}
                placeholder="Details about the maintenance work..."
                className="min-h-[60px]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setAddRepairOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Assign
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Status Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Maintenance Issue Status</DialogTitle>
            <DialogDescription>
              Change the status of the repair
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditStatus} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Repair Status</Label>
              <Select required value={editRepair.status} onValueChange={(value) => setEditRepair({ ...editRepair, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Repair Status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(repairStatuses).map(([Key, value]) => (
                    <SelectItem key={Key} value={Key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditOpen(false)}>
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
