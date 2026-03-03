import { useState, useEffect } from "react";
import { Tenant, tenantService } from "@/services/tenant.service";

export const useTenants = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTenants = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await tenantService.getAllTenants();
                setTenants(data);
            } catch (error) {
                setError("Could not fetch tenants");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTenants();
    }, []);

    const addTenant = (newTenant: Tenant) => {
        setTenants(prev => [...prev, newTenant]);
    };
    
    const updateTenant = (updatedTenant: Tenant) => {
        setTenants(prev => prev.map(h => h.id === updatedTenant.id ? updatedTenant : h));
    };

      return { tenants, isLoading, error, addTenant, updateTenant };
};