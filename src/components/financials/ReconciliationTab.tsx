import { useState, useRef } from "react";
import {
    Upload, FileSpreadsheet, RefreshCw,
    PlayCircle, AlertCircle, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatKES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
    Transaction, ReconciliationResult,
    transactionService
} from "@/services/transaction.service";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const PREVIEW_ROWS = 5;
const UNVERIFIED_LIMIT = 15;

const statusStyles: Record<string, string> = {
    matched: 'bg-success/10 text-success border-success/20',
    unmatched: 'bg-warning/10 text-warning border-warning/20',
    duplicate: 'bg-destructive/10 text-destructive border-destructive/20',
    unverified: 'bg-muted text-muted-foreground border-border',
};

interface PreviewRow {
    [key: string]: string;
}

const parseFilePreview = (file: File): Promise<PreviewRow[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });

                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                const rows: PreviewRow[] = XLSX.utils.sheet_to_json(sheet, {
                    defval: '',
                    raw: false,
                });

                resolve(rows.slice(0, PREVIEW_ROWS));
            } catch {
                reject(new Error("Could not parse file."))
            }
        };

        reader.onerror = () => reject(new Error("Could not read file."));
        reader.readAsArrayBuffer(file);
    });
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
    const [isReconciling, setIsReconciling] = useState(false);

    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
    const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
    const [isParsing, setIsParsing] = useState(false);

    const [reconcileResult, setReconcileResult] =
        useState<ReconciliationResult | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const unverified = transactions
        .filter(t => t.transaction_status?.toLowerCase() !== 'matched')
        .slice(0, UNVERIFIED_LIMIT);
    const totalUnverified = transactions.filter(
        t => t.transaction_status?.toLowerCase() !== 'matched'
    ).length;

    const handleFileSelected = async (file: File) => {
        const validTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];

        if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
            toast.error("Please upload a CSV or Excel file.");
            return;
        }

        setIsParsing(true);
        setPendingFile(file);
        setPreviewRows([]);
        setPreviewHeaders([]);

        try {
            const rows = await parseFilePreview(file);
            if (rows.length > 0) {
                setPreviewHeaders(Object.keys(rows[0]));
                setPreviewRows(rows);
            } else {
                toast.warning("File appears empty or has only headers.");
            }
        } catch {
            toast.error("Could not read file. Make sure it's a valid CSV.");
            setPendingFile(null);
        } finally {
            setIsParsing(false);
        }
    };

    const handleConfirmUpload = async () => {
        if (!pendingFile) return;

        setIsUploading(true);
        try {
            const result = await transactionService.uploadStatement(pendingFile);
            toast.success(`${result.count} transactions uploaded successfully.`);
            setPendingFile(null);
            setPreviewRows([]);
            setPreviewHeaders([]);
            await onStatementUploaded();
        } catch (err: any) {
            toast.error(
                err.response?.data?.detail || "Failed to upload bank statement."
            );
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancelUpload = () => {
        setPendingFile(null);
        setPreviewRows([]);
        setPreviewHeaders([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRunReconciliation = async () => {
        setIsReconciling(true);
        setReconcileResult(null);
        try {
            const result = await transactionService.runReconciliation();
            setReconcileResult(result);
            toast.success("Reconciliation complete.");
            await onStatementUploaded(); // refresh transactions
        } catch (err: any) {
            toast.error(
                err.response?.data?.detail || "Reconciliation failed."
            );
        } finally {
            setIsReconciling(false);
        }
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
        if (file) handleFileSelected(file);
    };

    return (
        <div className="space-y-6">

            {/* ===== Header with Run Reconciliation button ===== */}
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-muted-foreground">
                        Upload a bank statement to import transactions, then run
                        reconciliation to match them against recorded payments.
                    </p>
                </div>
                <Button
                    onClick={handleRunReconciliation}
                    disabled={isReconciling || transactions.length === 0}
                    variant="default"
                >
                    {isReconciling ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <PlayCircle className="mr-2 h-4 w-4" />
                    )}
                    {isReconciling ? 'Running...' : 'Run Reconciliation'}
                </Button>
            </div>

            {/* ===== Reconciliation result summary ===== */}
            {reconcileResult && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-xl border border-border">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-success">
                            {reconcileResult.matched}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Matched</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-warning">
                            {reconcileResult.unmatched}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Unmatched</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-destructive">
                            {reconcileResult.duplicates}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Duplicates</p>
                    </div>
                </div>
            )}

            {/* ===== Upload zone — hidden once file is selected ===== */}
            {!pendingFile && (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
                        isDragging
                            ? "border-primary bg-primary/5 scale-[1.01]"
                            : "border-border hover:border-primary/50 hover:bg-muted/30"
                    )}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xls,.xlsx"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelected(file);
                            e.target.value = '';
                        }}
                    />
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
                                {isDragging ? "Drop your bank statement here" : "Upload Bank Statement"}
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
                </div>
            )}

            {/* ===== File preview — shown after file selected, before upload ===== */}
            {pendingFile && (
                <div className="border border-border rounded-xl overflow-hidden">
                    <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-5 w-5 text-primary" />
                            <div>
                                <p className="font-medium text-sm">{pendingFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {isParsing
                                        ? "Reading file..."
                                        : `Showing first ${previewRows.length} rows — verify before uploading`
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelUpload}
                                disabled={isUploading}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleConfirmUpload}
                                disabled={isUploading || isParsing || previewRows.length === 0}
                            >
                                {isUploading ? (
                                    <><RefreshCw className="mr-2 h-3 w-3 animate-spin" /> Uploading...</>
                                ) : (
                                    <><ChevronRight className="mr-2 h-3 w-3" /> Confirm Upload</>
                                )}
                            </Button>
                        </div>
                    </div>

                    {isParsing ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin opacity-40" />
                            <p className="text-sm">Reading file...</p>
                        </div>
                    ) : previewRows.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        {previewHeaders.map(h => (
                                            <th
                                                key={h}
                                                className="text-left p-3 font-medium text-muted-foreground whitespace-nowrap"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {previewRows.map((row, i) => (
                                        <tr key={i} className="hover:bg-muted/20">
                                            {previewHeaders.map(h => (
                                                <td
                                                    key={h}
                                                    className="p-3 text-muted-foreground truncate max-w-[180px]"
                                                >
                                                    {row[h] || '—'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No readable rows found in this file.
                        </div>
                    )}
                </div>
            )}

            {/* ===== Unverified transactions table ===== */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold">Unverified Transactions</h3>
                        <p className="text-xs text-muted-foreground">
                            {totalUnverified > 0
                                ? `${totalUnverified} pending${totalUnverified > UNVERIFIED_LIMIT ? ` — showing first ${UNVERIFIED_LIMIT}` : ''}`
                                : 'No unverified transactions'
                            }
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <RefreshCw className="h-8 w-8 mx-auto mb-3 animate-spin opacity-30" />
                        <p>Loading transactions...</p>
                    </div>
                ) : unverified.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No unverified transactions.</p>
                        <p className="text-xs mt-1">
                            Upload a bank statement above to import transactions.
                        </p>
                    </div>
                ) : (
                    <>
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground">Reference</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {unverified.map(transaction => (
                                    <tr
                                        key={transaction.id}
                                        className="hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="p-4 text-muted-foreground">
                                            {transaction.transaction_date
                                                ? format(new Date(transaction.transaction_date), 'MMM dd, yyyy')
                                                : '—'
                                            }
                                        </td>
                                        <td className="p-4 font-mono text-xs text-muted-foreground">
                                            {transaction.transaction_reference ?? '—'}
                                        </td>
                                        <td className="p-4 font-semibold">
                                            {formatKES(transaction.amount)}
                                        </td>
                                        <td className="p-4">
                                            <Badge
                                                variant="outline"
                                                className={statusStyles[transaction.status?.toLowerCase()] ?? ''}
                                            >
                                                {transaction.transaction_status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Nudge to run reconciliation */}
                        {totalUnverified > 0 && (
                            <div className="p-4 border-t bg-warning/5 border-warning/20 flex items-center gap-3">
                                <AlertCircle className="h-4 w-4 text-warning shrink-0" />
                                <p className="text-sm text-warning">
                                    {totalUnverified} unverified transaction{totalUnverified > 1 ? 's' : ''} waiting —
                                    use <span className="font-semibold">Run Reconciliation</span> at the top to match them against recorded payments.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}