import { useState, useMemo } from "react";
import {
  Wrench, Plus, AlertTriangle,
  Clock, CheckCircle2, User, MapPin
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  useMaintenanceRequests
} from "@/hooks/useMaintenanceRequests";
import {
  MaintenanceRequest
} from "@/services/maintenance-request.service";
import { MaintenanceRequestForm } from "@/components/forms/MaintenanceRequestForm";
import { EditMaintenanceStatusForm } from "@/components/forms/EditMaintenanceStatusForm";
import { MaintenanceRequestDetailDialog } from "@/components/dialogs/MaintenanceRequestDetailDialog";

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

const columnStyles = {
  new: 'border-t-warning',
  'in-progress': 'border-t-primary',
  completed: 'border-t-success',
};

const iconStyles = {
  new: 'text-warning',
  'in-progress': 'text-primary',
  completed: 'text-success',
};

interface KanbanColumnProps {
  status: 'new' | 'in-progress' | 'completed';
  requests: MaintenanceRequest[];
  onSelect: (request: MaintenanceRequest) => void;
}

function KanbanColumn({ status, requests, onSelect }: KanbanColumnProps) {
  const StatusIcon = statusIcons[status];

  return (
    <div className={cn(
      "bg-muted/30 rounded-xl p-4 border-t-4",
      columnStyles[status]
    )}>
      <div className="flex items-center gap-2 mb-4">
        <StatusIcon className={cn("h-5 w-5", iconStyles[status])} />
        <h3 className="font-semibold">{statusLabels[status]}</h3>
        <Badge variant="secondary" className="ml-auto">
          {requests.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="empty-state py-12">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-primary/5 rounded-full scale-150 blur-xl" />
              <Wrench className="h-12 w-12 text-muted-foreground/40 relative" />
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">
              All clear! ✨
            </h3>
            <p className="text-xs text-muted-foreground/70">
              No requests in this category
            </p>
          </div>
        ) : (
          requests.map(request => (
            <div
              key={request.id}
              className="kanban-card cursor-pointer"
              onClick={() => onSelect(request)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold">{request.title}</h3>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(request.date_raised), "MMM dd, yyyy")}
                </span>
              </div>
              <p className="text-sm font-medium mb-2 line-clamp-2">
                {request.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{request.tenant?.name ?? "Vacant"}</span>
                <span>•</span>
                <MapPin className="h-3 w-3" />
                <span>{request.house.number}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- Page ---
export default function Maintenance() {
  const {
    maintenanceRequests,
    addMaintenanceRequest,
    updateMaintenanceRequest,
  } = useMaintenanceRequests();

  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [requestFormOpen, setRequestFormOpen] = useState(false);
  const [editStatusOpen, setEditStatusOpen] = useState(false);

  const groupedRequests = useMemo(() => ({
    new: maintenanceRequests.filter(r =>
      r.status.toLowerCase() === 'pending'
    ),
    'in-progress': maintenanceRequests.filter(r =>
      r.status.toLowerCase() === 'in progress'
    ),
    completed: maintenanceRequests.filter(r =>
      r.status.toLowerCase() === 'completed'
    ),
  }), [maintenanceRequests]);

  const handleSelectRequest = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
  };

  const handleEditStatus = () => {
    setEditStatusOpen(true);
  };

  return (
    <DashboardLayout
      title="Maintenance"
      description="Track and manage repair requests"
    >
      {/* ===== Stat cards ===== */}
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
          <p className="text-2xl font-bold">
            {groupedRequests['in-progress'].length}
          </p>
        </div>
        <div className="bg-success/10 rounded-xl p-4 border border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span className="text-sm font-medium text-success">Completed</span>
          </div>
          <p className="text-2xl font-bold">
            {groupedRequests.completed.length}
          </p>
        </div>
      </div>

      {/* ===== Header action ===== */}
      <div className="flex justify-end mb-3">
        <Button onClick={() => setRequestFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Raise Maintenance Request
        </Button>
      </div>

      <hr />

      {/* ===== Kanban Board — Desktop ===== */}
      <div className="hidden lg:grid grid-cols-3 gap-6 mt-3">
        {(['new', 'in-progress', 'completed'] as const).map(status => (
          <KanbanColumn
            key={status}
            status={status}
            requests={groupedRequests[status]}
            onSelect={handleSelectRequest}
          />
        ))}
      </div>

      {/* ===== List View — Mobile ===== */}
      <div className="lg:hidden space-y-4 mt-3">
        {(['new', 'in-progress', 'completed'] as const).map(status => (
          <div key={status}>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              {(() => {
                const Icon = statusIcons[status];
                return <Icon className={cn("h-4 w-4", iconStyles[status])} />;
              })()}
              {statusLabels[status]}
              <Badge variant="secondary">
                {groupedRequests[status].length}
              </Badge>
            </h3>
            <div className="space-y-3">
              {groupedRequests[status].map(request => (
                <div
                  key={request.id}
                  className="mobile-card cursor-pointer"
                  onClick={() => handleSelectRequest(request)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(request.date_raised), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{request.title}</h3>
                  <p className="text-sm font-normal mb-2">
                    {request.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{request.tenant?.name ?? "Vacant"}</span>
                    <span>•</span>
                    <span>{request.house.number}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ===== Request detail dialog ===== */}
      <MaintenanceRequestDetailDialog
        open={!!selectedRequest}
        onOpenChange={(open) => { if (!open) setSelectedRequest(null); }}
        request={selectedRequest}
        onEditStatus={handleEditStatus}
      />

      {/* ===== Forms ===== */}
      <MaintenanceRequestForm
        open={requestFormOpen}
        onOpenChange={setRequestFormOpen}
        onSuccess={(newRequest) => {
          addMaintenanceRequest(newRequest);
        }}
      />

      <EditMaintenanceStatusForm
        open={editStatusOpen}
        onOpenChange={setEditStatusOpen}
        request={selectedRequest}
        onSuccess={(updated) => {
          updateMaintenanceRequest(updated);
          setSelectedRequest(updated);
          setEditStatusOpen(false);
        }}
      />
    </DashboardLayout>
  );
}