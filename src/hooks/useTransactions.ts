// hooks/useTransactions.ts
import { useState, useEffect } from "react";
import { transactionService, Transaction } from "@/services/transaction.service";

export const useTransactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await transactionService.getAll();
                setTransactions(data);
            } catch (err) {
                setError("Could not fetch transactions.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    // Called after a successful bank statement upload
    // Replaces the entire list since the upload may affect many records
    const refreshTransactions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await transactionService.getAll();
            setTransactions(data);
        } catch (err) {
            setError("Could not refresh transactions.");
        } finally {
            setIsLoading(false);
        }
    };

    return { transactions, isLoading, error, refreshTransactions };
};