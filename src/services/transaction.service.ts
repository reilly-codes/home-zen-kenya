import { api } from "./api";

export interface Transaction {
    id: string;
    transaction_date: Date;
    amount: number;
    transaction_status: string;
    transaction_reference?: string;
}
export interface ReconciliationResult {
    matched: number;
    unmatched: number;
    duplicates: number;
}

export const transactionService = {
    getAll: async (): Promise<Transaction[]> => {
        const response = await api.get("/transactions/all");
        return response.data;
    },

    uploadStatement: async (file: File): Promise<{ count: number }> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post("/transactions/upload", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },

    runReconciliation: async () => {
        const response = await api.post("/reconciliation/run");
        return response.data;
    },
};