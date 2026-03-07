import { api } from "./api";

export interface Transaction {
    id: string;
    date: Date;
    description: string;
    amount: number;
    status: string;
    reference?: string;
}

export const transactionService = {
    getAll: async (): Promise<Transaction[]> => {
        const response = await api.get("/transactions/all");
        return response.data;
    },

    // Bank statement upload — different content type from all other services
    // File is sent as multipart/form-data, not JSON
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
};