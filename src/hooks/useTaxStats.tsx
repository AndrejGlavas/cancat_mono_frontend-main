import { useState, useEffect } from 'react';
import { transactionsApi } from '../services/transactionsApi';
import { taxYearApi } from '../services/taxYearApi';
import { businessPercentageApi } from '../services/businessPercentageApi';
import type { BusinessPercentageResponse, Transaction } from '../utils/types';

interface TaxStats {
  income: number;
  businessDeductions: number;
  personalDeductions: number;
  splitDeductions: number;
  totalTransactions: number;
  taxYear: number;
  businessPercentage: number;
  isLoading: boolean;
  transactions: Transaction[];  
}

export const useTaxStats = () => {
  const [stats, setStats] = useState<TaxStats>({
    income: 0,
    businessDeductions: 0,
    personalDeductions: 0,
    splitDeductions: 0,
    totalTransactions: 0,
    taxYear: 0,
    businessPercentage: 10, // Default value until API response
    isLoading: true, 
    transactions: [] 
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          taxYearResponse, 
          regularResponse, 
          incomeResponse,
          percentageResponse
        ] = await Promise.all([
          taxYearApi.get(),
          transactionsApi.fetch({
            page: 1,
            itemsPerPage: 5000,
            sortColumn: "date",
            sortDirection: "desc"
          }),
          transactionsApi.getIncomeTransactions({}),
          businessPercentageApi.get() as Promise<BusinessPercentageResponse>
        ]);

        // Get business percentage from API
        const businessPercentage = percentageResponse?.status === 'success' && percentageResponse.data
          ? percentageResponse.data.businessPercentage
          : 10; // Fallback to 10% if API fails

        // Calculate total transactions
        const totalTransactions = regularResponse.totalRecords + incomeResponse.transactions.length;

        // Calculate income
        const income = incomeResponse.transactions
          .filter(t => t.deposit && t.income)
          .reduce((sum, t) => sum + t.amount, 0);

        // Calculate business deductions
        const businessDeductions = regularResponse.transactions
          .filter(t => t.deposit === false && t.business === true && t.split === false && t.hidden === false)
          .reduce((sum, t) => sum + t.amount, 0);

        // Calculate personal deductions
        const personalDeductions = regularResponse.transactions
          .filter(t => !t.business && !t.deposit && t.tagId !== null)
          .reduce((sum, t) => sum + t.amount, 0);

        // Calculate split deductions using the dynamic business percentage
        const splitDeductions = regularResponse.transactions
          .filter(t => t.deposit === false && t.split === true)
          .reduce((sum, t) => sum + (t.amount * businessPercentage / 100), 0);

        setStats({
          income,
          businessDeductions,
          personalDeductions,
          splitDeductions,
          totalTransactions,
          taxYear: taxYearResponse.taxYear,
          businessPercentage,
          isLoading: false, 
          transactions: [...regularResponse.transactions, ...incomeResponse.transactions]
        });

      } catch (error) {
        console.error("Error fetching tax stats:", error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();
  }, []);

  return stats;
};

export type { TaxStats };