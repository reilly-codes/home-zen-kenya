import { api } from "./api";

export interface Invoice {
    tenant_id?: string;
    hse_id: string;
    rent_amount: number;
    amount: number;
    status: string;
    date_of_gen: Date;
    date_due: Date;
    id: string;
    comments: string;
}

export interface SaveInvoice {
    utilities: [
        {
            bill_type?: string;
            amount?: number;
        }
    ]   
}

export const invoiceService = {
    getAll: async (): Promise<[]> => {
        const response = await api.get("/invoices/rent/all");
        return response.data;
    },

    getSingleInvoice: async (invoice_id: string): Promise<Invoice> => {
        const response = await api.get(`/invoices/rent/${invoice_id}`);
        return response.data;
    },

    create: async(hse_id: string, invoice_data: SaveInvoice): Promise<Invoice> => {
        const response = await api.post(`/invoices/generate/rent/${hse_id}`, invoice_data);
        return response.data;
    },

    update: async(invoice_id: string, invoice_data: SaveInvoice): Promise<Invoice> => {
        const response = await api.patch(`/invoices/rent/${invoice_id}/edit`, invoice_data);
        return response.data;
    },

    bulkUpload: async(propertyId: string ,file: File): Promise<{count: number}> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post("/invoices/rent/bulk/upload", formData, {
            params: {
                property_id: propertyId
            },
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    }
}

