import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatKES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Transaction, transactionService } from "@/services/transaction.service";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
    matched: 'bg-success/10 text-success border-success/20',
    unmatched: 'bg-warning/10 text-warning border-warning/20',
    duplicate: 'bg-destructive/10 text-destructive border-destructive/20',
};

interface ReconciliationTabProps {
    transactions: Transaction[];
    isLoading: boolean;
    onStatementUploaded: () => Promise<void>;
}

export function ReconciliationTab({
    transactions,
    isLoading,
    onStatementUploaded,
}: ReconciliationTabProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const matched = transactions.filter(t => t.status?.toLowerCase() === 'matched').length;
    const unmatched = transactions.filter(t => t.status?.toLowerCase() === 'unmatched').length;
    const duplicate = transactions.filter(t => t.status?.toLowerCase() === 'duplicate').length;

    const handleFileUpload = async (file: File) => {
        const validTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];

        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a CSV or Excel file.");
            return;
        }

        setIsUploading(true);
        try {
            const result = await transactionService.uploadStatement(file);
            toast.success(`${result.count} transactions processed.`);
            await onStatementUploaded();
        } catch (err: any) {
            toast.error(
                err.response?.data?.detail || "Failed to process bank statement."
            );
        } finally {
            setIsUploading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
        e.target.value = '';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileUpload(file);
    };

    return (
        <div className="space-y-6">

            {/* ===== Upload zone ===== */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
                    isDragging
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : "border-border hover:border-primary/50 hover:bg-muted/30",
                    isUploading && "pointer-events-none opacity-60"
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    className="hidden"
                    onChange={handleInputChange}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                        <p className="font-medium">Processing bank statement...</p>
                        <p className="text-sm text-muted-foreground">
                            This may take a few seconds
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className={cn(
                            "p-4 rounded-full transition-colors",
                            isDragging ? "bg-primary/10" : "bg-muted"
                        )}>
                            <Upload className={cn(
                                "h-8 w-8 transition-colors",
                                isDragging ? "text-primary" : "text-muted-foreground"
                            )} />
                        </div>
                        <div>
                            <p className="font-medium">
                                {isDragging
                                    ? "Drop your bank statement here"
                                    : "Upload Bank Statement"
                                }
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Drag & drop or click to browse — CSV or Excel files only
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}
                        >
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Browse Files
                        </Button>
                    </div>
                )}
            </div>

            {/* ===== Summary cards ===== */}
            {transactions.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-success/5 border border-success/20 rounded-xl text-center">
                        <CheckCircle className="h-6 w-6 text-success mx-auto mb-2" />
                        <p className="text-2xl font-bold text-success">{matched}</p>
                        <p className="text-xs text-muted-foreground mt-1">Matched</p>
                    </div>
                    <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl text-center">
                        <AlertCircle className="h-6 w-6 text-warning mx-auto mb-2" />
                        <p className="text-2xl font-bold text-warning">{unmatched}</p>
                        <p className="text-xs text-muted-foreground mt-1">Unmatched</p>
                    </div>
                    <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl text-center">
                        <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
                        <p className="text-2xl font-bold text-destructive">{duplicate}</p>
                        <p className="text-xs text-muted-foreground mt-1">Duplicates</p>
                    </div>
                </div>
            )}

            {/* ===== Transactions table ===== */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold">Bank Transactions</h3>
                        <p className="text-xs text-muted-foreground">
                            {transactions.length} records loaded
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <RefreshCw className="h-8 w-8 mx-auto mb-3 animate-spin opacity-30" />
                        <p>Loading transactions...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No transactions yet.</p>
                        <p className="text-xs mt-1">
                            Upload a bank statement above to get started.
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Description</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Reference</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {transactions.map(transaction => (
                                <tr
                                    key={transaction.id}
                                    className="hover:bg-muted/30 transition-colors"
                                >
                                    <td className="p-4 text-muted-foreground">
                                        {transaction.date
                                            ? format(new Date(transaction.date), 'MMM dd, yyyy')
                                            : '—'
                                        }
                                    </td>
                                    <td className="p-4">
                                        <p className="font-medium truncate max-w-[200px]">
                                            {transaction.description}
                                        </p>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-muted-foreground">
                                        {transaction.reference ?? '—'}
                                    </td>
                                    <td className="p-4 font-semibold">
                                        {formatKES(transaction.amount)}
                                    </td>
                                    <td className="p-4">
                                        <Badge
                                            variant="outline"
                                            className={statusStyles[transaction.status?.toLowerCase()] ?? ''}
                                        >
                                            {transaction.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}