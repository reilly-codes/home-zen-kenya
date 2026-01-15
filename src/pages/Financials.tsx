import { useState, useCallback } from 'react';
import { Wallet, Upload, FileSpreadsheet, CheckCircle2, Clock, Plus, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { recentPayments, formatKES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Financials() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setUploadedFile(file);
        toast.success('File uploaded successfully!', {
          description: `${file.name} is ready for reconciliation.`,
        });
      } else {
        toast.error('Invalid file type', {
          description: 'Please upload a CSV or Excel file.',
        });
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
      toast.success('File uploaded successfully!');
    }
  };

  // Mock reconciliation data
  const mockBankTransactions = [
    { id: 'bank-1', date: '2024-12-05', description: 'MPESA 254712345678', amount: 45000, matched: true },
    { id: 'bank-2', date: '2024-12-04', description: 'BANK TRANSFER REF987654', amount: 35000, matched: false },
    { id: 'bank-3', date: '2024-12-03', description: 'MPESA 254756789012', amount: 42000, matched: true },
    { id: 'bank-4', date: '2024-12-02', description: 'MPESA 254723456789', amount: 25000, matched: false },
  ];

  return (
    <DashboardLayout
      title="Financials"
      description="Manage invoices, payments, and reconciliation"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-primary text-primary-foreground rounded-xl p-4">
          <p className="text-sm opacity-80">Total Collected</p>
          <p className="text-2xl font-bold">{formatKES(2410000)}</p>
          <p className="text-xs opacity-60">This month</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-warning">{formatKES(183000)}</p>
          <p className="text-xs text-muted-foreground">5 invoices</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Reconciled</p>
          <p className="text-2xl font-bold text-success">{formatKES(2227000)}</p>
          <p className="text-xs text-muted-foreground">92% matched</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="text-2xl font-bold text-destructive">{formatKES(83000)}</p>
          <p className="text-xs text-muted-foreground">2 tenants</p>
        </div>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <TabsList className="bg-muted">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reconciliation">Bank Reconciliation</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Generate Invoice
          </Button>
        </div>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tenant</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Method</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reference</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-muted-foreground">{payment.date}</td>
                    <td className="p-4 font-medium">{payment.tenantName}</td>
                    <td className="p-4 font-semibold text-success">{formatKES(payment.amount)}</td>
                    <td className="p-4 text-muted-foreground">{payment.method}</td>
                    <td className="p-4 text-muted-foreground font-mono text-sm">{payment.reference}</td>
                    <td className="p-4">
                      <Badge 
                        variant="outline" 
                        className={payment.status === 'reconciled' 
                          ? 'bg-success/10 text-success border-success/20' 
                          : 'bg-warning/10 text-warning border-warning/20'
                        }
                      >
                        {payment.status === 'reconciled' ? (
                          <><CheckCircle2 className="mr-1 h-3 w-3" />Reconciled</>
                        ) : (
                          <><Clock className="mr-1 h-3 w-3" />Pending</>
                        )}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="mobile-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{payment.tenantName}</p>
                    <p className="text-sm text-muted-foreground">{payment.date}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={payment.status === 'reconciled' 
                      ? 'bg-success/10 text-success border-success/20' 
                      : 'bg-warning/10 text-warning border-warning/20'
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-success">{formatKES(payment.amount)}</span>
                  <span className="text-sm text-muted-foreground">{payment.method}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Reconciliation Tab */}
        <TabsContent value="reconciliation" className="space-y-6">
          {/* Upload Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
            />
            <div className="flex flex-col items-center gap-4">
              <div className={cn(
                "h-16 w-16 rounded-full flex items-center justify-center transition-colors",
                isDragging ? "bg-primary/20" : "bg-muted"
              )}>
                <Upload className={cn(
                  "h-8 w-8",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <p className="font-medium mb-1">
                  {uploadedFile ? uploadedFile.name : 'Drop your bank statement here'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports CSV and Excel files
                </p>
              </div>
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Browse Files
                  </span>
                </Button>
              </label>
            </div>
          </div>

          {/* Reconciliation Table */}
          {uploadedFile && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Transaction Matching</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {mockBankTransactions.filter(t => t.matched).length}/{mockBankTransactions.length} Matched
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Bank Description</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockBankTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-muted-foreground">{transaction.date}</td>
                        <td className="p-4 font-mono text-sm">{transaction.description}</td>
                        <td className="p-4 font-semibold">{formatKES(transaction.amount)}</td>
                        <td className="p-4">
                          {transaction.matched ? (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Matched
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                              <Clock className="mr-1 h-3 w-3" />
                              Unmatched
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {!transaction.matched && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => toast.success('Transaction matched!')}
                            >
                              Match
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Invoice Management</h3>
            <p className="text-muted-foreground mb-4">
              Generate and manage invoices for your tenants
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create First Invoice
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
