import {
    useMemo
} from "react";
import {
    Invoice
} from "@/services/rentinvoice.service";
import {
    Payment
} from "@/services/payment.service";
import {
    MaintenanceInvoice
} from "@/services/maintenanceinvoice.service";
import {
    format
} from "date-fns";

interface UseReportsHookProps {
    rentInvoices ? : Invoice[];
    payments ? : Payment[];
    maintenanceInvoices ? : MaintenanceInvoice[]
}

export interface MonthlyRentData {
    month: string;
    collected: number;
    unpaid: number;
}

export interface MonthlyUtilityData {
    month: string;
    [billType: string]: string | number;
}

export interface MonthlyExpenditureData {
    month: string;
    laborCost: number;
    partsCost: number;
}

export interface MonthlyAccountData {
    month: string;
    in: number;
    out: number;
}

export const useReports = ({
    rentInvoices = [],
    payments = [],
    maintenanceInvoices = []
}: UseReportsHookProps = {}) => {
    const monthlyRentData = useMemo((): MonthlyRentData[] => {
        const months: Record < string, {
            collected: number;unpaid: number
        } > = {};

        payments.forEach(pay => {
            if (pay.status !== "VERIFIED") return;
            if (!pay.created_at) return;

            const month = format(new Date(pay.created_at), "MMM yy");
            if (!months[month]) months[month] = {
                collected: 0,
                unpaid: 0
            };
            months[month].collected += pay.amount_paid ?? 0;
        });

        rentInvoices.forEach(inv => {
            if (inv.status !== "UNPAID") return;
            if (!inv.date_of_gen || !inv.date_due) return;

            const month = format(new Date(inv.date_of_gen), "MMM yy");
            if (!months[month]) months[month] = {
                collected: 0,
                unpaid: 0
            };
            months[month].unpaid += inv.amount ?? 0;
        });

        return Object.entries(months).map(([month, data]) => ({
            month,
            ...data,
        }));
    }, [rentInvoices, payments]);

    const monthlyUtilityData = useMemo((): MonthlyUtilityData[] => {
        const months: Record < string, Record < string, number >> = {};

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
        const types = new Set < string > ();
        rentInvoices.forEach(inv => {
            inv.utilities?.forEach(u => types.add(u.bill_type.toUpperCase()));
        });
        return Array.from(types);
    }, [rentInvoices]);

    const monthlyExpenditureData = useMemo((): MonthlyExpenditureData[] => {
        const months: Record < string, {
            laborCost: number,
            partsCost: number
        } > = {};

        maintenanceInvoices.forEach(mi => {
            if (!mi.date_raised || mi.status !== "COMPLETED") return;
            const month = format(new Date(mi.date_raised), "MMM yy");
            if (!months[month]) months[month] = {
                laborCost: 0,
                partsCost: 0
            };
            months[month].laborCost += mi.labor_cost ?? 0;
            months[month].partsCost += mi.parts_cost ?? 0;
        });

        return Object.entries(months).map(([month, data]) => ({
            month,
            ...data,
        }));

    }, [maintenanceInvoices]);

    const monthlyAccounts = useMemo((): MonthlyAccountData[] => {
        const months: Record < string, {
            in: number,
            out: number
        } > = {};

        payments.forEach(pay => {
            if (pay.status !== "VERIFIED") return;
            if (!pay.created_at) return;

            const month = format(new Date(pay.created_at), "MMM yy");
            if (!months[month]) months[month] = {
                in: 0,
                out: 0
            };
            months[month].in += pay.amount_paid ?? 0;
        });

        maintenanceInvoices.forEach(mi => {
            if (!mi.date_raised || mi.status !== "COMPLETED") return;
            const month = format(new Date(mi.date_raised), "MMM yy");
            if (!months[month]) months[month] = {
                in: 0,
                out: 0
            };
            months[month].out += mi.labor_cost ?? 0;
        });

        return Object.entries(months).map(([month, data]) => ({
            month,
            ...data,
        }));

    }, [payments, maintenanceInvoices]);

    return {
        monthlyRentData,
        monthlyUtilityData,
        utilityTypes,
        monthlyExpenditureData,
        monthlyAccounts
    };

};