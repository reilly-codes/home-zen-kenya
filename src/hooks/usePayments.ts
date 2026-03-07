// hooks/usePayments.ts
import { useState, useEffect } from "react";
import { paymentService, Payment } from "@/services/payment.service";

export const usePayments = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPayments = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await paymentService.getAll();
                setPayments(data);
            } catch (err) {
                setError("Could not fetch payments.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const addPayment = (newPayment: Payment) => {
        // Newest first — most recent payment should appear at top
        setPayments(prev => [newPayment, ...prev]);
    };

    const updatePayment = (updatedPayment: Payment) => {
        setPayments(prev =>
            prev.map(p => p.id === updatedPayment.id ? updatedPayment : p)
        );
    };

    return { payments, isLoading, error, addPayment, updatePayment };
};