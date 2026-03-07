import { api } from "./api";

export interface MaintenanceInvoice {
    id: string;
    hse_id: string;
    title: string;
    description: string;
    labor_cost: number;
    parts_cost: number;
    total_amount: number;
    status: string;           // repair status: PENDING, IN_PROGRESS, COMPLETED
    payment_status: string;   // payment status: UNPAID, PAID
    date_raised: Date;
    house?: {
        number: string;
        property_id: string;
    };
    tenant?: {
        name: string;
    };
}

export interface CreateMaintenanceInvoice {
    hse_id: string;
    title: string;
    description: string;
    labor_cost: number;
    parts_cost: number;
}

export interface UpdateMaintenanceInvoice {
    labor_cost: number;
    parts_cost: number;
}

export const maintenanceService = {
    getAll: async (): Promise<MaintenanceInvoice[]> => {
        const response = await api.get("/invoices/maintenance/all");
        return response.data;
    },

    getSingle: async (invoice_id: string): Promise<MaintenanceInvoice> => {
        const response = await api.get(`/invoices/maintenance/${invoice_id}`);
        return response.data;
    },

    create: async (data: CreateMaintenanceInvoice): Promise<MaintenanceInvoice> => {
        const response = await api.post("/invoices/generate/maintenance/", data);
        return response.data;
    },

    update: async (
        invoice_id: string,
        data: UpdateMaintenanceInvoice
    ): Promise<MaintenanceInvoice> => {
        const response = await api.patch(
            `/invoices/maintenance/${invoice_id}/edit`,
            data
        );
        return response.data;
    },
};