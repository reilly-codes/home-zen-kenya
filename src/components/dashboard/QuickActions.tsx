import { UserPlus, Receipt, MessageSquare, FileUp } from 'lucide-react';

interface QuickAction {
    icon: React.ElementType;
    label: string;
    description: string;
    action: () => void;
}

interface QuickActionsProps {
    onAddTenant: () => void;
    onLogPayment: () => void;
    onBroadcast: () => void;
    onUploadStatement: () => void;
}

export function QuickActions({
    onAddTenant,
    onLogPayment,
    onBroadcast,
    onUploadStatement,
}: QuickActionsProps) {
    const actions: QuickAction[] = [
        {
            icon: UserPlus,
            label: 'Add New Tenant',
            description: 'Register a new tenant',
            action: onAddTenant,
        },
        {
            icon: Receipt,
            label: 'Log Payment',
            description: 'Record a new payment',
            action: onLogPayment,
        },
        {
            icon: MessageSquare,
            label: 'Send Broadcast',
            description: 'Message all tenants',
            action: onBroadcast,
        },
        {
            icon: FileUp,
            label: 'Upload Statement',
            description: 'Bank reconciliation',
            action: onUploadStatement,
        },
    ];

    return (
        <div className="bg-card rounded-xl border border-border shadow-sm">
            <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">
                    Frequently used operations
                </p>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        onClick={action.action}
                        className="quick-action-btn text-left"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <action.icon className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                            {action.label}
                        </span>
                        <span className="text-xs text-muted-foreground text-center">
                            {action.description}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}