import { useState, useEffect } from "react";
import { maintenanceService, MaintenanceInvoice } from "@/services/maintenanceinvoice.service";

export const useMaintenanceInvoices = () => {
    const [maintenanceInvoices, setMaintenanceInvoices] = useState<MaintenanceInvoice[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMaintenanceInvoices = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await maintenanceService.getAll();
                setMaintenanceInvoices(data);
            } catch (err) {
                setError("Could not fetch maintenance invoices.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMaintenanceInvoices();
    }, []);

    const addMaintenanceInvoice = (newInvoice: MaintenanceInvoice) => {
        setMaintenanceInvoices(prev => [newInvoice, ...prev]);
    };

    const updateMaintenanceInvoice = (updatedInvoice: MaintenanceInvoice) => {
        setMaintenanceInvoices(prev =>
            prev.map(i => i.id === updatedInvoice.id ? updatedInvoice : i)
        );
    };

    return {
        maintenanceInvoices,
        isLoading,
        error,
        addMaintenanceInvoice,
        updateMaintenanceInvoice,
    };
};
