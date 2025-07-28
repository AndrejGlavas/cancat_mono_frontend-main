// hooks/useTransactionType.ts
import { useState, useCallback } from 'react';
import { TransactionType } from '../utils/types';

interface UseTransactionTypeProps {
  initialType?: TransactionType;
  onChange?: (type: TransactionType) => void;
}

export const useTransactionType = ({ 
  initialType, 
  onChange 
}: UseTransactionTypeProps) => {
  const [transactionType, setTransactionType] = useState<TransactionType | undefined>(
    initialType
  );

  const handleTypeChange = useCallback((newType: TransactionType) => {
    setTransactionType(newType);
    onChange?.(newType);
  }, [onChange]);

  const toggleType = useCallback(() => {
    const newType = transactionType === TransactionType.BUSINESS 
      ? TransactionType.PERSONAL 
      : TransactionType.BUSINESS;
    handleTypeChange(newType);
  }, [transactionType, handleTypeChange]);

  return {
    transactionType,
    setTransactionType: handleTypeChange,
    toggleType
  };
};