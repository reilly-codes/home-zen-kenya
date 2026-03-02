import { Wallet, Download, FileText, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tenants, formatKES } from '@/lib/mock-data';
import { toast } from 'sonner';

// Mock invoices for tenant
const tenantInvoices = [
  { id: 'INV-2024-001', date: '2024-12-01', description: 'December 2024 Rent', amount: 45000, status: 'pending' as const },
  { id: 'INV-2024-002', date: '2024-11-01', description: 'November 2024 Rent', amount: 45000, status: 'paid' as const },
  { id: 'INV-2024-003', date: '2024-10-01', description: 'October 2024 Rent', amount: 45000, status: 'paid' as const },
  { id: 'INV-2024-004', date: '2024-09-01', description: 'September 2024 Rent', amount: 45000, status: 'paid' as const },
  { id: 'INV-2024-005', date: '2024-08-01', description: 'August 2024 Rent', amount: 45000, status: 'paid' as const },
];

export default function TenantInvoices() {
  const currentTenant = tenants.find(t => t.id === 'tenant-1')!;
  const totalOutstanding = tenantInvoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const handleDownload = (invoiceId: string) => {
    toast.success(`Downloading ${invoiceId}...`, {
      description: 'Your invoice PDF will be ready shortly.',
    });
  };

  const handlePayNow = () => {
    toast.info('Redirecting to M-Pesa payment gateway...', {
      description: 'This would integrate with M-Pesa STK Push in production.',
    });
  };

  return (
    <DashboardLayout
      title="My Invoices"
      description="View and manage your rental invoices"
    >
      {/* Outstanding Balance Card */}
      <Card className="mb-8 bg-gradient-to-br from-primary/5 to-accent border-primary/20 rounded-2xl overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Outstanding Balance</p>
              <p className="text-4xl md:text-5xl font-bold text-primary">
                {formatKES(totalOutstanding)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {totalOutstanding > 0 ? 'Payment due by the 5th of the month' : 'You\'re all caught up! 🎉'}
              </p>
            </div>
            {totalOutstanding > 0 && (
              <Button 
                size="lg" 
                onClick={handlePayNow}
                className="rounded-2xl px-8 py-6 text-lg font-semibold hover:scale-105 transition-transform w-full sm:w-auto"
              >
                <Wallet className="mr-2 h-5 w-5" />
                Pay Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Invoice History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tenantInvoices.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Invoice #</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenantInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4 font-medium">{invoice.id}</td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {new Date(invoice.date).toLocaleDateString('en-KE', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="py-4 px-4">{invoice.description}</td>
                        <td className="py-4 px-4 text-right font-semibold">{formatKES(invoice.amount)}</td>
                        <td className="py-4 px-4 text-center">
                          <Badge 
                            variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                            className={`rounded-full ${
                              invoice.status === 'paid' 
                                ? 'bg-success/10 text-success border-success/20' 
                                : 'bg-warning/10 text-warning border-warning/20'
                            }`}
                          >
                            {invoice.status === 'paid' ? (
                              <><CheckCircle2 className="h-3 w-3 mr-1" /> Paid</>
                            ) : (
                              <><Clock className="h-3 w-3 mr-1" /> Pending</>
                            )}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDownload(invoice.id)}
                            className="rounded-xl hover:bg-primary/10 hover:text-primary"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {tenantInvoices.map((invoice) => (
                  <div key={invoice.id} className="mobile-card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(invoice.date).toLocaleDateString('en-KE', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <Badge 
                        variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                        className={`rounded-full ${
                          invoice.status === 'paid' 
                            ? 'bg-success/10 text-success border-success/20' 
                            : 'bg-warning/10 text-warning border-warning/20'
                        }`}
                      >
                        {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{invoice.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold">{formatKES(invoice.amount)}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDownload(invoice.id)}
                        className="rounded-xl"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <Sparkles className="empty-state-icon" />
              <h3 className="empty-state-title">No invoices yet!</h3>
              <p className="empty-state-description">Your invoices will appear here once generated.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}