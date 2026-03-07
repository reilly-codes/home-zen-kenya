import { api } from "./api";

export interface MaintenanceRequest {
    id: string;
    title: string;
    description: string;
    date_raised: Date;
    status: string;       
    tenant?: {
        name: string;
    };
    house: {
        number: string;
    };
}

export interface CreateMaintenanceRequest {
    hse_id: string;
    title: string;
    description: string;
}

export interface UpdateMaintenanceRequestStatus {
    status: string;
}

export const maintenanceRequestService = {
    getAll: async (): Promise<MaintenanceRequest[]> => {
        const response = await api.get("/maintenance/all");
        return response.data;
    },

    create: async (data: CreateMaintenanceRequest): Promise<MaintenanceRequest> => {
        const response = await api.post("/maintenance/generate", data);
        return response.data;
    },

    updateStatus: async (
        request_id: string,
        data: UpdateMaintenanceRequestStatus
    ): Promise<MaintenanceRequest> => {
        const response = await api.patch(
            `/maintenance/edit-status/${request_id}`,
            data
        );
        return response.data;
    },
};