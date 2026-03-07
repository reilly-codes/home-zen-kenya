import { useState, useEffect } from "react";
import {
    maintenanceRequestService,
    MaintenanceRequest
} from "@/services/maintenance-request.service";

export const useMaintenanceRequests = () => {
    const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRequests = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await maintenanceRequestService.getAll();
                setMaintenanceRequests(data);
            } catch (err) {
                setError("Could not fetch maintenance requests.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const addMaintenanceRequest = (newRequest: MaintenanceRequest) => {
        setMaintenanceRequests(prev => [...prev, newRequest]);
    };

    const updateMaintenanceRequest = (updatedRequest: MaintenanceRequest) => {
        setMaintenanceRequests(prev =>
            prev.map(r => r.id === updatedRequest.id ? updatedRequest : r)
        );
    };

    return {
        maintenanceRequests,
        isLoading,
        error,
        addMaintenanceRequest,
        updateMaintenanceRequest,
    };
};