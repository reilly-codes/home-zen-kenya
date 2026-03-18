import { useState, useEffect, useRef } from "react";
import {
    Upload, FileSpreadsheet, RefreshCw, ChevronRight, Download
} from "lucide-react";
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Property } from "@/services/property.service";
import { invoiceService } from "@/services/rentinvoice.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

interface BulkUploadInvoiceFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    properties: Property[];
    onSuccess: () => void;
}

const PREVIEW_ROWS = 5;

interface PreviewRow {
    [key: string]: string;
}

const parseFilePreview = (file: File): Promise<PreviewRow[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            // try {
            //     const text = e.target?.result as string;
            //     const lines = text.trim().split('\n').filter(Boolean);

            //     if (lines.length < 2) { resolve([]); return; }

            //     const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            //     const rows = lines.slice(1, PREVIEW_ROWS + 1).map(line => {
            //         const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            //         const row: PreviewRow = {};
            //         headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
            //         return row;
            //     });

            //     resolve(rows);
            // } catch {
            //     reject(new Error("Could not parse file."));
            // }

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

export function BulkUploadInvoiceForm({
    open,
    onOpenChange,
    properties,
    onSuccess,
}: BulkUploadInvoiceFormProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedProperty, setSelectedProperty] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
    const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
    const [isParsing, setIsParsing] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Reset everything when dialog closes ───────────────────────────────────
    useEffect(() => {
        if (!open) {
            setStep(1);
            setSelectedProperty("");
            setError(null);
            setPendingFile(null);
            setPreviewRows([]);
            setPreviewHeaders([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [open]);

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
        if (!pendingFile || !selectedProperty) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await invoiceService.bulkUpload(selectedProperty, pendingFile);
            toast.success(`${result.count} invoices uploaded successfully.`);
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Could not bulk upload invoices.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelFile = () => {
        setPendingFile(null);
        setPreviewRows([]);
        setPreviewHeaders([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelected(file);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="md:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Rent Invoices</DialogTitle>
                    <DialogDescription>
                        {step === 1
                            ? "Select the property these invoices belong to."
                            : "Upload a CSV or Excel file with the invoice data."
                        }
                    </DialogDescription>
                </DialogHeader>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-2">
                    <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in slide-in-from-top-2 duration-300">
                        {error}
                    </div>
                )}

                {/* ===== STEP 1 — Select Property ===== */}
                {step === 1 && (
                    <div className="space-y-6 mt-2">
                        <div className="space-y-2">
                            <Label>Property</Label>
                            <select
                                value={selectedProperty}
                                onChange={(e) => setSelectedProperty(e.target.value)}
                                className="w-full bg-background border border-input px-3 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-ring"
                            >
                                <option value="" disabled>Select property</option>
                                {properties.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={!selectedProperty}
                                onClick={() => setStep(2)}
                            >
                                Next — Upload File
                            </Button>
                        </div>
                    </div>
                )}

                {/* ===== STEP 2 — Upload + Preview ===== */}
                {step === 2 && (
                    <div className="space-y-4 mt-2">

                        {/* Upload zone — hidden once a file is picked */}
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
                                            {isDragging ? "Drop your file here" : "Upload Invoice File"}
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

                        {/* File preview — shown after file selected, before upload */}
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
                                            onClick={handleCancelFile}
                                            disabled={isLoading}
                                        >
                                            Change File
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleConfirmUpload}
                                            disabled={isLoading || isParsing || previewRows.length === 0}
                                        >
                                            {isLoading ? (
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

                        {/* Back button — only when no file pending so it doesn't compete with Change File */}
                        {!pendingFile && (
                            <div className="flex justify-start">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}