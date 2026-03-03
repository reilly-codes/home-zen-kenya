import { api } from "./api";

export interface Tenant {
    name: string;
    email: string;
    tel: string;
    role_id: number;
    national_id: string;
    hse: string;
    status: string;
    id: string;
    wallet_balance: number;
    created_at: Date
}

export interface CreateTenant {
    name: string;
    email: string;
    tel: string;
    national_id: string;
    hse: string;
}

export interface UpdateTenant {
    name?: string;
    email?: string;
    tel?: string;
    national_id?: string;
    hse?: string;
}

export const tenantService = {
    getAllTenants: async (): Promise<Tenant[]> => {
        const response = await api.get(`/tenants/all`);
        return response.data;
    },

    getSingleTenant: async (tenant_id: string): Promise<Tenant> => {
        const response = await api.get(`/tenants/${tenant_id}`);
        return response.data
    },
    
    create: async (property_id: string, tenant_data: CreateTenant) : Promise<Tenant> => {
        const response = await api.post(`/tenants/create/properties/${property_id}`, tenant_data);
        return response.data
    },

    update: async(tenant_id: string, tenant_data: UpdateTenant) : Promise<Tenant> => {
        const response = await api.patch(`/tenants/${tenant_id}/edit`, tenant_data);
        return response.data
    },
}