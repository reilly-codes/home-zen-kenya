import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Tenant } from '@/services/tenant.service';

interface BroadcastFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tenants: Tenant[];
}

export function BroadcastForm({ open, onOpenChange, tenants }: BroadcastFormProps) {
    const [sendToAll, setSendToAll] = useState(true);
    const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
    const [smsEnabled, setSmsEnabled] = useState(true);
    const [whatsappEnabled, setWhatsappEnabled] = useState(false);
    const [message, setMessage] = useState('');

    const handleTenantToggle = (tenantId: string, checked: boolean) => {
        if (checked) {
            setSelectedTenants(prev => [...prev, tenantId]);
        } else {
            setSelectedTenants(prev => prev.filter(id => id !== tenantId));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Guard — at least one channel must be selected
        if (!smsEnabled && !whatsappEnabled) return;

        const channels = [
            smsEnabled && 'SMS',
            whatsappEnabled && 'WhatsApp',
        ].filter(Boolean).join(' and ');

        const recipientDescription = sendToAll
            ? `${tenants.length} tenants`
            : `${selectedTenants.length} selected tenants`;

        toast.success(`Broadcast sent via ${channels}!`, {
            description: `Message sent to ${recipientDescription}`,
        });

        // Reset and close
        setMessage('');
        setSelectedTenants([]);
        setSendToAll(true);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Broadcast Message</DialogTitle>
                    <DialogDescription>
                        Send a message to your tenants via SMS or WhatsApp
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* Send to All Toggle */}
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                            <p className="font-medium">Send to All Tenants</p>
                            <p className="text-sm text-muted-foreground">
                                {sendToAll
                                    ? `${tenants.length} tenants will receive this message`
                                    : 'Select specific tenants below'
                                }
                            </p>
                        </div>
                        <Switch checked={sendToAll} onCheckedChange={setSendToAll} />
                    </div>

                    {/* Individual Tenant Selection */}
                    {!sendToAll && (
                        <div className="space-y-2 max-h-40 overflow-y-auto p-4 border border-border rounded-lg">
                            {tenants.map((tenant) => (
                                <div key={tenant.id} className="flex items-center gap-3">
                                    <Checkbox
                                        id={tenant.id}
                                        checked={selectedTenants.includes(tenant.id)}
                                        onCheckedChange={(checked) =>
                                            handleTenantToggle(tenant.id, !!checked)
                                        }
                                    />
                                    <Label htmlFor={tenant.id} className="flex-1 cursor-pointer">
                                        {tenant.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Message */}
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            className="min-h-[120px]"
                            required
                        />
                    </div>

                    {/* Channel Selection */}
                    <div className="space-y-3">
                        <Label>Send via:</Label>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="sms"
                                    checked={smsEnabled}
                                    onCheckedChange={(checked) => setSmsEnabled(!!checked)}
                                />
                                <Label htmlFor="sms" className="cursor-pointer">SMS</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="whatsapp"
                                    checked={whatsappEnabled}
                                    onCheckedChange={(checked) => setWhatsappEnabled(!!checked)}
                                />
                                <Label htmlFor="whatsapp" className="cursor-pointer">WhatsApp</Label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!smsEnabled && !whatsappEnabled}
                        >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Send Broadcast
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}