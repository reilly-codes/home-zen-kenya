import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Wallet, Upload, FileSpreadsheet, CheckCircle2, Clock, Plus,
  Download, FileText, User, Calendar, Hammer, ArrowRight, RefreshCw, X, Loader2,
  MoreHorizontal, Pencil, Banknote
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatKES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { format, subDays, isAfter } from 'date-fns';
import * as XLSX from 'xlsx';

const statusStyles = {
  // General statuses
  verified: 'bg-success/10 text-success border-success/20',
  unverified: 'bg-warning/10 text-warning border-warning/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',

  // Invoice statuses
  paid: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  unpaid: 'bg-muted text-muted-foreground border-border',
  completed: 'bg-success/10 text-success border-success/20',
  in_progress: 'bg-blue-100 text-blue-600 border-blue-200',
};

export default function Financials() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenInvoiceOpen, setIsGenInvoiceOpen] = useState(false);

  // --- STATE FOR INVOICE GENERATION ---
  const [invoiceType, setInvoiceType] = useState<'rent' | 'maintenance'>('rent');
  const [invoiceFormStep, setInvoiceFormStep] = useState<number>(1);

  const [newInvoiceForm, setNewInvoiceForm] = useState({
    utilities: [
      { bill_type: "WATER", amount: 0 },
      { bill_type: "ELECTRICITY", amount: 0 }
    ]
  });

  const [newMaintenanceForm, setNewMaintenanceForm] = useState({
    title: "",
    description: "",
    labor_cost: 0,
    parts_cost: 0
  });

  // --- STATE FOR PAYMENTS ---
  const [payments, setPayments] = useState([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    type: 'general', // Default to general
    link_id: '',
    amount_paid: 0,
    transaction_ref: '',
    status: 'UNVERIFIED'
  });

  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [allUnits, setAllUnits] = useState([]);
  const [maintenanceInvoicableUnits, setMaintenanceInvoicableUnits] = useState([])
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnitsLoading, setIsUnitsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allTransactions, setAllTransactions] = useState([]);
  const [rentInvoices, setRentInvoices] = useState([]);
  const [maintenanceInvoices, setMaintenanceInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [viewInvoiceOpen, setViewInvoiceOpen] = useState(false);
  const [invoiceRepairRequst, setInvoiceRepairRequest] = useState({
    labor_cost: 0,
    parts_cost: 0
  });
  const [isEditMaintenanceInvoiceOpen, setIsEditMaintenanceInvoiceOpen] = useState(false);

  // --- INITIAL DATA FETCHING ---
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await api.get("/properties/all");
        setProperties(response.data);
      } catch (err) {
        console.error("Failed to fetch Properties: ", err);
      }
    };

    const fetchFinancialData = async () => {
      setIsLoading(true);
      try {
        // Fetch Invoices
        try {
          const rentResponse = await api.get("/invoices/rent/all");
          setRentInvoices(rentResponse.data);
        } catch (err) { console.error("Failed to fetch rent invoices", err) }

        try {
          const maintResponse = await api.get("/invoices/maintenance/all");
          setMaintenanceInvoices(maintResponse.data);
        } catch (err) { console.error("Failed to fetch maintenance invoices", err) }

        // Fetch Payments
        try {
          const payResponse = await api.get("/payments/all");
          setPayments(payResponse.data);
        } catch (err) { console.error("Failed to fetch payments", err) }

      } finally {
        setIsLoading(false);
      }
    };

    const fetchTranscations = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/transactions/all");
        setAllTransactions(response.data);
      } catch (err) {
        setError(err);
        console.error("Could not fetch transactions: ", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
    fetchFinancialData();
    fetchTranscations();
  }, []);

  useEffect(() => {
    if (!selectedProperty) return;

    const fetchHouses = async () => {
      setIsUnitsLoading(true);
      try {
        const response = await api.get(`/properties/${selectedProperty}/houses/all`)
        const houses = response.data;
        const occupiedHouses = [];
        houses.forEach(element => {
          if (element.status == "OCCUPIED") {
            occupiedHouses.push(element)
          }
        });
        setAllUnits(occupiedHouses);
        setMaintenanceInvoicableUnits(houses);
      } catch (err) {
        console.error("Failed to fetch Units: ", err);
      } finally {
        setIsUnitsLoading(false);
      }
    };

    fetchHouses();
  }, [selectedProperty]);


  // --- COMPUTED VALUES ---
  const recentPayments = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    return payments
      .filter(p => isAfter(new Date(p.created_at), thirtyDaysAgo))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [payments]);

  // --- FILE HANDLING ---
  const parseFile = (file: File) => {
    const reader = new FileReader();

    reader.readAsArrayBuffer(file);
    reader.onload = (e) => {
      const data = e.target?.result;
      try {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (jsonData.length > 0) {
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1, 6);

          setPreviewHeaders(headers);
          setPreviewData(rows);
          setUploadedFile(file);
          toast.success("File Upload Successful. Please Review");
        } else {
          toast.error("File Appears to be empty");
        }
      } catch (error) {
        console.error(error);
        toast.error("Could not parse file. Ensure it is a valid CSV or Excel file.");
      }
    };
  };

  // --- INVOICE HANDLERS ---
  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await api.post(`/invoices/generate/rent/${selectedUnit}`, newInvoiceForm);
      toast.success("Rent invoice generated");
      setIsGenInvoiceOpen(false);
      setRentInvoices((prev) => [response.data, ...prev]);
      setNewInvoiceForm({ utilities: [{ bill_type: "WATER", amount: 0 }, { bill_type: "ELECTRICITY", amount: 0 }] });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate invoice");
    }
  }

  const handleAddMaintenanceInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedUnit || !newMaintenanceForm.title) {
      setError("Please fill in the title and select a unit");
      return;
    }

    try {
      const payload = {
        hse_id: selectedUnit,
        title: newMaintenanceForm.title,
        description: newMaintenanceForm.description,
        labor_cost: newMaintenanceForm.labor_cost,
        parts_cost: newMaintenanceForm.parts_cost,
      };

      const response = await api.post(`/invoices/generate/maintenance/`, payload);

      toast.success("Maintenance bill created");
      setIsGenInvoiceOpen(false);
      setMaintenanceInvoices((prev) => [response.data, ...prev]);

      setNewMaintenanceForm({
        title: "",
        description: "",
        labor_cost: 0,
        parts_cost: 0
      });
      setInvoiceFormStep(1);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate bill");
    }
  };

  const editMaintenaceInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null);

    try {
      const response = await api.patch(`/invoices/maintenance/${selectedInvoice}/edit`, invoiceRepairRequst);
      toast.success("Repair invoiced successfully");
      setIsEditMaintenanceInvoiceOpen(false);
      setMaintenanceInvoices((prevRepairs) => prevRepairs.map((repair) =>
        repair.id === response.data.id ? response.data : repair
      ));
      setInvoiceRepairRequest({
        labor_cost: 0,
        parts_cost: 0
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Could not edit invoice")
    }

  };

  const openGenerateModal = () => {
    setSelectedProperty(null);
    setSelectedUnit(null);
    setInvoiceFormStep(1);
    setNewMaintenanceForm({ title: "", description: "", labor_cost: 0, parts_cost: 0 });
    setNewInvoiceForm({ utilities: [{ bill_type: "WATER", amount: 0 }, { bill_type: "ELECTRICITY", amount: 0 }] });
    setIsGenInvoiceOpen(true);
  }

  // --- PAYMENT HANDLERS ---
  const openAddPayment = () => {
    setEditingPayment(null);
    setPaymentForm({
      type: 'general', // Default to general for quick entry
      link_id: '',
      amount_paid: 0,
      transaction_ref: '',
      status: 'UNVERIFIED'
    });
    setIsPaymentDialogOpen(true);
  };

  const openEditPayment = (payment: any) => {
    setEditingPayment(payment.id);

    // Determine type: if no link ID is found, it's 'general'
    let type = 'general';
    if (payment.invoice_id) type = 'rent';
    else if (payment.maintenance_bill_id) type = 'maintenance';

    const linkId = payment.invoice_id || payment.maintenance_bill_id || '';

    setPaymentForm({
      type: type,
      link_id: linkId,
      amount_paid: payment.amount_paid,
      transaction_ref: payment.transaction_ref,
      status: payment.status
    });
    setIsPaymentDialogOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        amount_paid: Number(paymentForm.amount_paid),
        transaction_ref: paymentForm.transaction_ref,
        amount_expected: 0,
        invoice_id: null,
        maintenance_bill_id: null
      };

      // Handle specific linking based on type
      if (paymentForm.type === 'rent') {
        payload.invoice_id = paymentForm.link_id;
        const inv = rentInvoices.find(i => i.id === paymentForm.link_id);
        if (inv) payload.amount_expected = inv.amount;
      } 
      // If type is 'general', IDs remain null

      let response;
      if (editingPayment) {
        // PATCH: Include status
        payload.status = paymentForm.status;
        response = await api.patch(`/edit/payment/${editingPayment}`, payload);
        toast.success("Payment updated");
        setPayments(prev => prev.map(p => p.id === editingPayment ? response.data : p));
      } else {
        // POST: Do NOT send status (default UNVERIFIED)
        response = await api.post("/process/payment", payload);
        toast.success("Payment recorded");
        setPayments(prev => [response.data, ...prev]);
      }

      setIsPaymentDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save payment");
    }
  };

  // --- RECONCILIATION & UPLOAD HANDLERS ---
  const handleRunReconciliation = async () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Running reconciliation...',
        success: 'Payments matched successfully!',
        error: 'Failed to reconcile'
      }
    )
  }

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
        parseFile(file);
      } else {
        toast.error('Invalid file type');
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      parseFile(files[0]);
    }
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setPreviewHeaders([]);
    setPreviewData([]);
  };

  const handleConfirmUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await api.post("/transactions/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(`Success! ${response.data.count || ''} transactions processed.`)
      clearUpload();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || "Upload failed";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const openUnit = allUnits.find(u => u.id === selectedUnit);

  const viewedInvoice = selectedInvoice
    ? (rentInvoices.find(i => i.id === selectedInvoice) || maintenanceInvoices.find(i => i.id === selectedInvoice))
    : null;

  const editingInvoice = selectedInvoice
    ? (rentInvoices.find(i => i.id === selectedInvoice) || maintenanceInvoices.find(i => i.id === selectedInvoice))
    : null;

  useEffect(() => {
    if (editingInvoice) {
      setInvoiceRepairRequest({
        labor_cost: editingInvoice.labor_cost || 0,
        parts_cost: editingInvoice.parts_cost || 0,
      })
    }
  }, [editingInvoice]);
  // Mock Data for reconciliation demo
  const mockBankTransactions = allTransactions;
  let totalCollected: number = 0;
  let totalReconciled: number = 0;
  payments.forEach(pay => {
    totalCollected += pay.amount_paid;
    if (pay.status == "VERIFIED") {
      totalReconciled += pay.amount_paid;
    }
  });

  const percentageReconciled = () => {
    if (!totalCollected || totalCollected === 0) return 0;
    return (totalReconciled / totalCollected) * 100;
  }

  let pendingTotalBills: number = 0;
  let pendingInvoiceCount = 0;
  let overDueTotal: number = 0;
  rentInvoices.forEach(invoice => {
    if (invoice.status === "UNPAID") {
      pendingTotalBills += invoice.amount;
      pendingInvoiceCount++;
      const today = new Date();
      if (new Date(invoice.date_due) < today) {
        overDueTotal += invoice.amount;
      }
    }
  });

  maintenanceInvoices.forEach(bill => {
    if (bill.payment_status === "UNPAID" && bill.status == "COMPLETED") {
      pendingTotalBills += bill.total_amount;
      pendingInvoiceCount++;
    }
  });


  return (
    <DashboardLayout title="Financials" description="Manage invoices and payments">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-primary text-primary-foreground rounded-xl p-4">
          <p className="text-sm opacity-80">Total Collected</p>
          <p className="text-2xl font-bold">{formatKES(totalCollected)}</p>
          <p className="text-xs opacity-60">This month</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-warning">{formatKES(pendingTotalBills)}</p>
          <p className="text-xs text-muted-foreground">{pendingInvoiceCount} invoices</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Reconciled</p>
          <p className="text-2xl font-bold text-success">{formatKES(totalReconciled)}</p>
          <p className="text-xs text-muted-foreground">{percentageReconciled().toFixed(1)}% matched</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="text-2xl font-bold text-destructive">{formatKES(overDueTotal)}</p>
          {/* <p className="text-xs text-muted-foreground">2 tenants</p> */}
        </div>
      </div>

      <Tabs defaultValue="invoices" className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <TabsList className="bg-muted">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="transactions">Payments</TabsTrigger>
            <TabsTrigger value="reconciliation">Bank Statement</TabsTrigger>
          </TabsList>

          <Button onClick={handleRunReconciliation} variant="outline" className="border-primary/20 hover:bg-primary/5 text-primary">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reconcile Payments
          </Button>
        </div>

        {/* --- TRANSACTIONS (PAYMENTS) TAB --- */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b bg-muted/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-semibold">Recent Payments (Last 30 Days)</h3>
                <p className="text-xs text-muted-foreground">Showing {recentPayments.length} records</p>
              </div>
              <Button onClick={openAddPayment} className="bg-primary text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </div>

            {recentPayments.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Reference</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentPayments.map(payment => {
                    // Determine display type
                    let typeLabel = "General";
                    let typeIcon = <Wallet className="h-3 w-3" />;
                    let typeClass = "bg-gray-100 text-gray-600";

                    if (payment.invoice_id) {
                      typeLabel = "Rent";
                      typeIcon = <FileText className="h-3 w-3" />;
                      typeClass = "bg-blue-100 text-blue-600";
                    } else if (payment.maintenance_bill_id) {
                      typeLabel = "Maintenance";
                      typeIcon = <Hammer className="h-3 w-3" />;
                      typeClass = "bg-orange-100 text-orange-600";
                    }

                    return (
                      <tr key={payment.id} className="hover:bg-muted/5 transition-colors">
                        <td className="p-4">
                          {format(new Date(payment.created_at), "MMM dd, yyyy")}
                          <p className="text-xs text-muted-foreground">{format(new Date(payment.created_at), "HH:mm")}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={cn("p-1.5 rounded-full", typeClass)}>
                              {typeIcon}
                            </div>
                            <span className="font-medium">{typeLabel}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-xs">{payment.transaction_ref}</td>
                        <td className="p-4 font-semibold">{formatKES(payment.amount_paid)}</td>
                        <td className="p-4">
                          <Badge variant="outline" className={statusStyles[payment.status?.toLowerCase()] || "bg-gray-100"}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openEditPayment(payment)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <Banknote className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No payments recorded in the last 30 days.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Reconciliation Tab */}
        <TabsContent value="reconciliation" className="space-y-6">
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input type="file" id="file-upload" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} />
            <div className="flex flex-col items-center gap-4">
              <div className={cn("h-16 w-16 rounded-full flex items-center justify-center transition-colors", isDragging ? "bg-primary/20" : "bg-muted")}>
                <Upload className={cn("h-8 w-8", isDragging ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div>
                <p className="font-medium mb-1">{uploadedFile ? uploadedFile.name : 'Drop your bank statement here'}</p>
                <p className="text-sm text-muted-foreground mb-4">Supports CSV and Excel files</p>
              </div>
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span><FileSpreadsheet className="mr-2 h-4 w-4" /> Browse Files</span>
                </Button>
              </label>
            </div>
          </div>
          {uploadedFile && previewData.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{uploadedFile.name}</h4>
                    <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(2)} KB • {previewData.length} preview rows</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={clearUpload} disabled={isUploading}>
                    <X className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                  <Button onClick={handleConfirmUpload} disabled={isUploading}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    {isUploading ? "Uploading..." : "Confirm & Upload"}
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      {previewHeaders.map((header, i) => (
                        <th key={i} className="p-3 text-left font-medium text-muted-foreground whitespace-nowrap">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell: any, cellIndex: number) => (
                          <td key={cellIndex} className="p-3 whitespace-nowrap">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 text-center bg-muted/20 text-xs text-muted-foreground">
                Showing first 5 rows for verification
              </div>
            </div>
          )}
          {/* Mock Table */}
          {!uploadedFile && mockBankTransactions.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Desc</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-right p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBankTransactions.map(t => (
                    <tr key={t.id} className="border-t">
                      <td className="p-4">{t.date}</td>
                      <td className="p-4">{t.description}</td>
                      <td className="p-4">{formatKES(t.amount)}</td>
                      <td className="p-4 text-right"><Badge variant="outline">{t.matched ? "Matched" : "Unmatched"}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Invoice Management</h3>

            <div className="mb-8">
              <Button onClick={openGenerateModal}>
                <Plus className="mr-2 h-4 w-4" />
                Generate Invoice
              </Button>
            </div>

            {/* CHECK IF EITHER LIST HAS DATA */}
            {(rentInvoices?.length > 0 || maintenanceInvoices?.length > 0) ? (
              <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden mb-2 text-left">

                {/* --- RENT INVOICES TABLE --- */}
                {rentInvoices?.length > 0 && (
                  <div className="mb-8">
                    <h5 className="font-semibold my-4 px-4 flex items-center gap-2">
                      <span className="bg-primary/10 text-primary p-1 rounded">Rent</span>
                    </h5>
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Unit</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tenant</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Generated</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Due Date</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {rentInvoices.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <p className="font-medium">{invoice.house?.number || "N/A"}</p>
                              <p className="text-sm text-muted-foreground">
                                {properties.find(p => p.id === invoice.house?.property_id)?.name}
                              </p>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary">
                                    {invoice.tenant?.name ? invoice.tenant.name.split(' ').map(n => n[0]).join('') : '?'}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{invoice.tenant?.name || "Unknown"}</p>
                                  <p className="text-sm text-muted-foreground">{invoice.tenant?.tel}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              {invoice.date_of_gen ? format(new Date(invoice.date_of_gen), "MMM dd, yyyy") : "-"}
                            </td>
                            <td className="p-4">
                              {invoice.date_due ? format(new Date(invoice.date_due), "MMM dd, yyyy") : "-"}
                            </td>
                            <td className="p-4 font-semibold">{formatKES(invoice.amount)}</td>
                            <td className="p-4">
                              <Badge variant="outline" className={statusStyles[invoice.status?.toLowerCase()] || "bg-gray-100"}>
                                {invoice.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-right">
                              <Button variant="ghost" size="sm" onClick={() => {
                                setSelectedInvoice(invoice.id);
                                setViewInvoiceOpen(true);
                              }}>
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* --- MAINTENANCE INVOICES TABLE --- */}
                {maintenanceInvoices?.length > 0 && (
                  <div>
                    <h5 className="font-semibold my-4 px-4 flex items-center gap-2">
                      <span className="bg-orange-100 text-orange-600 p-1 rounded">Maintenance</span>
                    </h5>
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Unit</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tenant</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Issue</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date Raised</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cost</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Job Status</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {maintenanceInvoices.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <p className="font-medium">{invoice.house?.number || "N/A"}</p>
                              <p className="text-sm text-muted-foreground">
                                {properties.find(p => p.id === invoice.house?.property_id)?.name}
                              </p>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary">
                                    {invoice.tenant?.name ? invoice.tenant.name.split(' ').map(n => n[0]).join('') : '?'}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{invoice.tenant?.name || "Landlord Expense"}</p>
                                  <p className="text-sm text-muted-foreground">{invoice.tenant?.tel}</p>
                                </div>
                              </div>
                            </td>
                            {/* Maintenance Specific Columns */}
                            <td className="p-4 font-medium">
                              {invoice.title}
                            </td>
                            <td className="p-4">
                              {invoice.date_raised ? format(new Date(invoice.date_raised), "MMM dd, yyyy") : "-"}
                            </td>
                            <td className="p-4 font-semibold">{invoice?.total_amount != null ? formatKES(invoice.total_amount) : "Uninvoiced"}</td>
                            <td className="p-4">
                              <Badge variant="outline" className={statusStyles[invoice.status?.toLowerCase()] || "bg-gray-100"}>
                                {invoice.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-right">
                              <Button variant="ghost" size="sm" onClick={() => {
                                setSelectedInvoice(invoice.id);
                                setViewInvoiceOpen(true);
                              }}>
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12">
                <p className="text-muted-foreground mb-4">
                  Generate and manage invoices for your tenants. No invoices found.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* GENERATE INVOICE MODAL */}
      <Dialog open={isGenInvoiceOpen} onOpenChange={setIsGenInvoiceOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {invoiceFormStep === 1 ? "Select Invoice Type" : `Generate ${invoiceType === 'rent' ? 'Rent' : 'Maintenance'} Invoice`}
            </DialogTitle>
            <DialogDescription>
              {invoiceFormStep === 1
                ? "Choose the type of invoice you want to generate"
                : `Step ${invoiceFormStep - 1}: ${invoiceFormStep === 2 ? "Select Property" : invoiceFormStep === 3 ? "Select Unit" : "Enter Details"}`
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={invoiceType === 'rent' ? handleAddInvoice : handleAddMaintenanceInvoice} className="space-y-4 mt-4">
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            {(() => {
              switch (invoiceFormStep) {
                case 1:
                  return (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div
                        onClick={() => setInvoiceType('rent')}
                        className={cn(
                          "cursor-pointer rounded-xl border-2 p-4 hover:border-primary hover:bg-primary/5 transition-all text-center space-y-3",
                          invoiceType === 'rent' ? "border-primary bg-primary/5" : "border-border"
                        )}
                      >
                        <div className="h-12 w-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium">Rent Invoice</p>
                          <p className="text-xs text-muted-foreground mt-1">Standard monthly rent & utilities</p>
                        </div>
                      </div>

                      <div
                        onClick={() => setInvoiceType('maintenance')}
                        className={cn(
                          "cursor-pointer rounded-xl border-2 p-4 hover:border-primary hover:bg-primary/5 transition-all text-center space-y-3",
                          invoiceType === 'maintenance' ? "border-primary bg-primary/5" : "border-border"
                        )}
                      >
                        <div className="h-12 w-12 mx-auto rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                          <Hammer className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium">Maintenance Bill</p>
                          <p className="text-xs text-muted-foreground mt-1">Ad-hoc repairs and services</p>
                        </div>
                      </div>

                      <div className="col-span-2 flex justify-end mt-4">
                        <Button type="button" onClick={() => setInvoiceFormStep(2)}>
                          Next Step <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );

                case 2:
                  return (
                    <>
                      <div className="space-y-4">
                        <Label>Select Property</Label>
                        <select
                          onChange={(e) => setSelectedProperty(e.target.value)}
                          value={selectedProperty || ""}
                          className='w-full bg-background border border-input px-3 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-ring'
                        >
                          <option value="" disabled>Select Property</option>
                          {properties.map((property) => (
                            <option key={property.id} value={property.id}>{property.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-between mt-6">
                        <Button type="button" variant="ghost" onClick={() => setInvoiceFormStep(1)}>
                          Back
                        </Button>
                        <Button type="button" disabled={!selectedProperty} onClick={() => setInvoiceFormStep(3)}>
                          Next
                        </Button>
                      </div>
                    </>
                  );

                case 3:
                  return (
                    <>
                      <div className="space-y-2">
                        <Label>Select Unit</Label>
                        <select
                          onChange={(e) => setSelectedUnit(e.target.value)}
                          value={selectedUnit || ""}
                          className='w-full bg-background border border-input px-3 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-ring'
                        >
                          <option value="" disabled>Select Unit</option>
                          {(invoiceType === 'rent' ? allUnits : maintenanceInvoicableUnits).map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.number} - {unit.status}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedUnit && invoiceType === 'rent' && openUnit && (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base Rent:</span>
                            <span className="font-medium">{formatKES(openUnit.rent)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Status:</span>
                            <Badge variant="outline" className="text-xs">{openUnit.status}</Badge>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between mt-6">
                        <Button type="button" variant="ghost" onClick={() => setInvoiceFormStep(2)}>
                          Back
                        </Button>
                        <Button type="button" disabled={!selectedUnit} onClick={() => setInvoiceFormStep(4)}>
                          Next
                        </Button>
                      </div>
                    </>
                  );

                case 4:
                  if (invoiceType === 'rent') {
                    return (
                      <>
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-muted-foreground">Add Utility Charges</h4>
                          <div className="space-y-3">
                            <Label>Water Bill</Label>
                            <Input
                              type="number"
                              value={newInvoiceForm.utilities[0].amount}
                              onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, utilities: newInvoiceForm.utilities.map((util, i) => i === 0 ? { ...util, amount: Number(e.target.value) } : util) })}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label>Electricity Bill</Label>
                            <Input
                              type="number"
                              value={newInvoiceForm.utilities[1].amount}
                              onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, utilities: newInvoiceForm.utilities.map((util, i) => i === 1 ? { ...util, amount: Number(e.target.value) } : util) })}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className="flex justify-between mt-6">
                          <Button type="button" variant="ghost" onClick={() => setInvoiceFormStep(3)}>
                            Back
                          </Button>
                          <Button type="submit">Generate Rent Invoice</Button>
                        </div>
                      </>
                    );
                  }
                  else {
                    return (
                      <>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Issue Title</Label>
                            <Input
                              value={newMaintenanceForm.title}
                              onChange={(e) => setNewMaintenanceForm({ ...newMaintenanceForm, title: e.target.value })}
                              placeholder="e.g., Leaking Sink Repair"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={newMaintenanceForm.description}
                              onChange={(e) => setNewMaintenanceForm({ ...newMaintenanceForm, description: e.target.value })}
                              placeholder="Details about the maintenance work..."
                              className="min-h-[60px]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Labor Cost</Label>
                              <Input
                                type="number"
                                value={newMaintenanceForm.labor_cost}
                                onChange={(e) => setNewMaintenanceForm({ ...newMaintenanceForm, labor_cost: Number(e.target.value) })}
                                placeholder="0.00"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Parts Cost</Label>
                              <Input
                                type="number"
                                value={newMaintenanceForm.parts_cost}
                                onChange={(e) => setNewMaintenanceForm({ ...newMaintenanceForm, parts_cost: Number(e.target.value) })}
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          <div className="pt-2 flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Estimated Total:</span>
                            <span className="font-bold text-lg">
                              {formatKES(newMaintenanceForm.labor_cost + newMaintenanceForm.parts_cost)}
                            </span>
                          </div>

                        </div>
                        <div className="flex justify-between mt-6">
                          <Button type="button" variant="ghost" onClick={() => setInvoiceFormStep(3)}>
                            Back
                          </Button>
                          <Button type="submit">Generate Bill</Button>
                        </div>
                      </>
                    );
                  }

                default:
                  return null;
              }
            })()}
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit maintenance invoice */}
      <Dialog open={isEditMaintenanceInvoiceOpen} onOpenChange={setIsEditMaintenanceInvoiceOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {editingInvoice && (
            <>
              <DialogHeader className='sm:max-w-[500px]'>
                <DialogTitle>Edit Maintenance invoice</DialogTitle>
                <DialogDescription className="font-mono text-xs text-muted-foreground">
                  ID: {editingInvoice.id}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{editingInvoice.title || "Rent Invoice"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {editingInvoice.house?.number} • {properties.find(p => p.id === editingInvoice.house?.property_id)?.name}
                    </p>
                  </div>
                  <Badge className={statusStyles[editingInvoice.status?.toLowerCase()]}>
                    {editingInvoice.status}
                  </Badge>
                  <Badge>
                    {editingInvoice.payment_status}
                  </Badge>
                </div>
                <form onSubmit={editMaintenaceInvoice} className='space-y-4 mt-4'>
                  <div className="space-y-2">
                    <Label>Labor Cost</Label>
                    <Input
                      type="number"
                      value={invoiceRepairRequst.labor_cost === 0 ? "" : invoiceRepairRequst.labor_cost}
                      onChange={(e) => setInvoiceRepairRequest({ ...invoiceRepairRequst, labor_cost: Number(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parts Cost</Label>
                    <Input
                      type="number"
                      value={invoiceRepairRequst.parts_cost === 0 ? "" : invoiceRepairRequst.parts_cost}
                      onChange={(e) => setInvoiceRepairRequest({ ...invoiceRepairRequst, parts_cost: Number(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="pt-2 flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Estimated Total:</span>
                    <span className="font-bold text-lg">
                      {formatKES(invoiceRepairRequst.labor_cost + invoiceRepairRequst.parts_cost)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-6">
                    <Button type="button" variant="ghost" onClick={() => setIsEditMaintenanceInvoiceOpen(false)}>
                      Close
                    </Button>
                    <Button type="submit">Update Invoice</Button>
                  </div>
                </form>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* RECORD PAYMENT DIALOG (UPDATED FOR GENERAL PAYMENTS) */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingPayment ? "Edit Payment" : "Record New Payment"}</DialogTitle>
            <DialogDescription>
              {editingPayment ? "Update payment details" : "Manually record a payment received from a tenant."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePayment} className="space-y-4 mt-4">

            {/* 1. Payment Type */}
            <div className="grid grid-cols-3 gap-2">
              <div
                onClick={() => !editingPayment && setPaymentForm({ ...paymentForm, type: 'general', link_id: '' })}
                className={cn(
                  "cursor-pointer rounded-lg border p-2 text-center transition-all flex flex-col items-center justify-center gap-1",
                  paymentForm.type === 'general' ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted",
                  editingPayment && "opacity-50 cursor-not-allowed"
                )}
              >
                <Wallet className="h-4 w-4" />
                <span className="font-medium text-xs">General / Wallet</span>
              </div>

              <div
                onClick={() => !editingPayment && setPaymentForm({ ...paymentForm, type: 'rent', link_id: '' })}
                className={cn(
                  "cursor-pointer rounded-lg border p-2 text-center transition-all flex flex-col items-center justify-center gap-1",
                  paymentForm.type === 'rent' ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted",
                  editingPayment && "opacity-50 cursor-not-allowed"
                )}
              >
                <FileText className="h-4 w-4" />
                <span className="font-medium text-xs">Rent Invoice</span>
              </div>

              {/* <div
                onClick={() => !editingPayment && setPaymentForm({ ...paymentForm, type: 'maintenance', link_id: '' })}
                className={cn(
                  "cursor-pointer rounded-lg border p-2 text-center transition-all flex flex-col items-center justify-center gap-1",
                  paymentForm.type === 'maintenance' ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted",
                  editingPayment && "opacity-50 cursor-not-allowed"
                )}
              >
                <Hammer className="h-4 w-4" />
                <span className="font-medium text-xs">Maintenance</span>
              </div> */}
            </div>

            {/* 2. Select Invoice/Bill (Conditional) */}
            {paymentForm.type !== 'general' && (
              <div className="space-y-2">
                <Label>Select {paymentForm.type === 'rent' ? 'Invoice' : 'Bill'} to Pay</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={paymentForm.link_id}
                  onChange={(e) => setPaymentForm({ ...paymentForm, link_id: e.target.value })}
                  required={paymentForm.type !== 'general'}
                  disabled={!!editingPayment}
                >
                  <option value="" disabled>Select an outstanding item</option>
                  {paymentForm.type === 'rent' && (
                    rentInvoices
                      .filter(inv => inv.status !== 'PAID') // Only show unpaid
                      .map(inv => (
                        <option key={inv.id} value={inv.id}>
                          Unit {inv.house?.number} - {formatKES(inv.amount)} (Due: {format(new Date(inv.date_due), 'MMM dd')})
                        </option>
                      ))
                  ) 
                  // : (
                  //   maintenanceInvoices
                  //     .filter(bill => bill.payment_status !== 'PAID')
                  //     .map(bill => (
                  //       <option key={bill.id} value={bill.id}>
                  //         {bill.title} - {formatKES(bill.total_amount || bill.amount)}
                  //       </option>
                  //     ))
                  // )
                  }
                </select>
              </div>
            )}

            {/* 3. Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount Paid</Label>
                <Input
                  type="number"
                  value={paymentForm.amount_paid}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount_paid: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Transaction Ref</Label>
                <Input
                  placeholder="e.g. MPESA_CODE"
                  value={paymentForm.transaction_ref}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transaction_ref: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* 4. Status - Only show when editing! */}
            {editingPayment && (
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={paymentForm.status}
                  onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                >
                  <option value="UNVERIFIED">Unverified</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingPayment ? "Update Payment" : "Record Payment"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Invoice Modal */}
      <Dialog open={viewInvoiceOpen} onOpenChange={setViewInvoiceOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {viewedInvoice ? (
            <>
              <DialogHeader>
                <DialogTitle>Invoice Details</DialogTitle>
                <DialogDescription className="font-mono text-xs text-muted-foreground">
                  ID: {viewedInvoice.id}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{viewedInvoice.title || "Rent Invoice"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {viewedInvoice.house?.number} • {properties.find(p => p.id === viewedInvoice.house?.property_id)?.name}
                    </p>
                  </div>
                  <Badge className={statusStyles[viewedInvoice.status?.toLowerCase()]}>
                    {viewedInvoice.status}
                  </Badge>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg flex justify-between items-center">
                  <span className="font-medium">Total Amount</span>
                  <span className="text-2xl font-bold font-mono">
                    {formatKES(viewedInvoice.amount || viewedInvoice.total_amount)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">Tenant</span>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-medium">{viewedInvoice.tenant?.name || "N/A"}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground block mb-1">Dates</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>
                        Generated: {viewedInvoice.date_of_gen || viewedInvoice.date_raised ? format(new Date(viewedInvoice.date_of_gen || viewedInvoice.date_raised), "MMM dd") : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setViewInvoiceOpen(false)}>Close</Button>
                  {
                    maintenanceInvoices.some((invoice) => invoice.id === selectedInvoice && invoice.status != "COMPLETED") && (
                      <Button variant="default" className='bg-warning' onClick={() => setIsEditMaintenanceInvoiceOpen(true)}><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
                    )
                  }
                  <Button variant="default"> <FileText className="mr-2 h-4 w-4" />Download PDF</Button>
                </DialogFooter>
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-muted-foreground">Loading invoice data...</div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}