import { api } from "./api";

export interface Payment {
    id: string;
    tenant_id: string;
    amount_paid: number;
    amount_expected: number;
    transaction_ref: string;
    status: string;                // UNVERIFIED, VERIFIED, FAILED
    invoice_id: string | null;     // set if linked to a rent invoice, null if general
    created_at: Date;
}

export interface CreatePayment {
    tenant_id: string;
    amount_paid: number;
    amount_expected: number;
    transaction_ref: string;
    invoice_id: string | null;
}

export interface UpdatePayment {
    tenant_id: string;
    amount_paid: number;
    amount_expected: number;
    transaction_ref: string;
    invoice_id: string | null;
    status: string;
}

export const paymentService = {
    getAll: async (): Promise<Payment[]> => {
        const response = await api.get("/payments/all");
        return response.data;
    },

    create: async (data: CreatePayment): Promise<Payment> => {
        const response = await api.post("/process/payment", data);
        return response.data;
    },

    update: async (payment_id: string, data: UpdatePayment): Promise<Payment> => {
        const response = await api.patch(`/edit/payment/${payment_id}`, data);
        return response.data;
    },
};