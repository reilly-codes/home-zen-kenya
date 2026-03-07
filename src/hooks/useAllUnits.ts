import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { House } from "@/services/house.service";

export const useAllUnits = () => {
    const [units, setUnits] = useState<House[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllUnits = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get("/landlords/units/all");
                setUnits(response.data);
            } catch (err) {
                setError("Could not load units.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllUnits();
    }, []);

    return { units, isLoading, error };
};