// hooks/useTransactionHistory.ts
import { useState } from 'react';
import { TransLog } from '../utils/types';
import { transactionsApi } from '../services/transactionsApi';


interface UseTransactionHistoryProps {
  onError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useTransactionHistory = ({ onError }: UseTransactionHistoryProps) => {
  const [historyData, setHistoryData] = useState<TransLog[]>([]);
  const [showTransactionHistoryModal, setShowTransactionHistoryModal] = useState(false);

  const fetchHistory = async (transactionId: number): Promise<TransLog[]> => {
    try {
      const data = await transactionsApi.getLogs(transactionId);
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch logs';
      onError(errorMessage);
      throw error;
    }
  };

  const handleHistoryClick = async (transactionId: number) => {
    try {
      const history = await fetchHistory(transactionId);
      setHistoryData(history);
      setShowTransactionHistoryModal(true);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  return {
    historyData,
    showTransactionHistoryModal,
    setShowTransactionHistoryModal,
    handleHistoryClick
  };
};