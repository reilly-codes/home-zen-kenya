// hooks/useRentInvoices.ts
import { useState, useEffect } from "react";
import { invoiceService, Invoice } from "@/services/rentinvoice.service";

export const useRentInvoices = () => {
    const [rentInvoices, setRentInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRentInvoices = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await invoiceService.getAll();
                setRentInvoices(data);
            } catch (err) {
                setError("Could not fetch rent invoices.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRentInvoices();
    }, []);

    const addRentInvoice = (newInvoice: Invoice) => {
        setRentInvoices(prev => [newInvoice, ...prev]);
    };

    const updateRentInvoice = (updatedInvoice: Invoice) => {
        setRentInvoices(prev =>
            prev.map(i => i.id === updatedInvoice.id ? updatedInvoice : i)
        );
    };

    return { rentInvoices, isLoading, error, addRentInvoice, updateRentInvoice };
};