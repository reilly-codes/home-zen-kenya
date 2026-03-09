import { useMemo } from "react";
import { Invoice } from "@/services/rentinvoice.service";
import { Payment } from "@/services/payment.service";
import { format } from "date-fns";

export interface MonthlyRentData {
    month: string;
    collected: number;
    unpaid: number;
}

export interface MonthlyUtilityData {
    month: string;
    [billType: string]: string | number;
}

export const useReports = (rentInvoices: Invoice[], payments: Payment[]) => {
    const monthlyRentData = useMemo((): MonthlyRentData[] => {
        const months: Record<string, { collected: number; unpaid: number }> = {};
        
        payments.forEach(pay => {
            if (pay.status !== "VERIFIED") return;
            if (!pay.created_at) return;

            const month = format(new Date(pay.created_at), "MMM yy");
            if (!months[month]) months[month] = { collected: 0, unpaid: 0 };
            months[month].collected += pay.amount_paid ?? 0;
        });

        rentInvoices.forEach(inv => {
            if (inv.status !== "UNPAID") return;
            if (!inv.date_due) return;

            const month = format(new Date(inv.date_due), "MMM yy");
            if (!months[month]) months[month] = { collected: 0, unpaid: 0 };
            months[month].unpaid += inv.amount ?? 0;
        });

        return Object.entries(months).map(([month, data]) => ({
            month,
            ...data,
        }));
    }, [rentInvoices, payments]);

    const monthlyUtilityData = useMemo((): MonthlyUtilityData[] => {
        const months: Record<string, Record<string, number>> = {};

        rentInvoices.forEach(inv => {
            if (!inv.date_of_gen || !inv.utilities?.length) return;
            const month = format(new Date(inv.date_of_gen), "MMM yy");

            if (!months[month]) months[month] = {};

            inv.utilities.forEach(utility => {
                const type = utility.bill_type.toUpperCase();
                months[month][type] = (months[month][type] ?? 0) + (utility.amount ?? 0);
            });
        });

        return Object.entries(months).map(([month, data]) => ({
            month,
            ...data,
        }));
    }, [rentInvoices]);

    const utilityTypes = useMemo((): string[] => {
        const types = new Set<string>();
        rentInvoices.forEach(inv => {
            inv.utilities?.forEach(u => types.add(u.bill_type.toUpperCase()));
        });
        return Array.from(types);
    }, [rentInvoices]);

    return { monthlyRentData, monthlyUtilityData, utilityTypes };

};