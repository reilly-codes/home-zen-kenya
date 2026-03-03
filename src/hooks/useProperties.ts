import { useState, useEffect } from "react";
import { propertyService, Property } from "@/services/property.service";

export const useProperties = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProperties = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await propertyService.getAll();
            setProperties(data);
        } catch (error) {
            setError("Could not load properties:");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const addProperty = (newProperty: Property) => {
        setProperties(prev => [...prev, newProperty]);
    };

    return { properties, isLoading, error, refetch: fetchProperties, addProperty };
};