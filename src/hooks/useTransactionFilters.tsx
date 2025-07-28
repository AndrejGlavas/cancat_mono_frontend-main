import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TransactionQueryState, TransactionType, TransactionFilters } from '../utils/types';



interface UseTransactionFiltersProps {
  queryState: TransactionQueryState;
  onChange: (state: Partial<TransactionQueryState>) => void;
  onError: (error: string | null) => void;
  onUpdateComplete?: () => void;
}

export const useTransactionFilters = ({
  queryState,
  onChange,
  onError,
  onUpdateComplete
}: UseTransactionFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Local state for form inputs
  const [localState, setLocalState] = useState({
    keyword: queryState.filters.search || '',
    amount: {
      min: queryState.filters.minAmount?.toString() || '',
      max: queryState.filters.maxAmount?.toString() || ''
    }
  });

  // Sync URL parameters with filter state
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    
    // Update search params
    if (queryState.filters.search) {
      newParams.set('search', queryState.filters.search);
    } else {
      newParams.delete('search');
    }

    // Update amount params
    if (queryState.filters.minAmount) {
      newParams.set('minAmount', queryState.filters.minAmount.toString());
    } else {
      newParams.delete('minAmount');
    }
    
    if (queryState.filters.maxAmount) {
      newParams.set('maxAmount', queryState.filters.maxAmount.toString());
    } else {
      newParams.delete('maxAmount');
    }

    // Update month param
    if (queryState.filters.month) {
      newParams.set('month', queryState.filters.month);
    } else {
      newParams.delete('month');
    }

    // Update transaction type
    if (queryState.transactionType) {
      newParams.set('type', queryState.transactionType);
    } else {
      newParams.delete('type');
    }

    if (queryState.filters.split !== undefined && queryState.filters.split !== null) {
      newParams.set('split', queryState.filters.split.toString());
    } else {
      newParams.delete('split');
    }


    setSearchParams(newParams, { replace: true });
  }, [queryState, setSearchParams]);

  const applyFilters = useCallback((updates: Partial<TransactionFilters>) => {
    const newFilters = {
      ...queryState.filters,
      ...updates
    };
  
    Object.keys(newFilters).forEach(key => {
      const value = newFilters[key as keyof typeof newFilters];
      if (key === 'split') {
        if (value === '') {  // <-- This might be the issue
          delete newFilters[key as keyof typeof newFilters];
        }
      } else if (value === undefined || value === '') {
        delete newFilters[key as keyof typeof newFilters];
      }
    });

    // Validate amount range
    if (newFilters.minAmount && newFilters.maxAmount &&
      Number(newFilters.minAmount) > Number(newFilters.maxAmount)) {
      onError("Minimum amount cannot be greater than maximum amount");
      return;
    }

    onChange({
      ...queryState,
      filters: newFilters
    });

    onError(null);
    onUpdateComplete?.();
  }, [queryState, onChange, onError, onUpdateComplete]);

  const handleTypeChange = useCallback((type: TransactionType) => {
    onChange({
      ...queryState,
      transactionType: queryState.transactionType === type ? undefined : type
    });
    onUpdateComplete?.();
  }, [queryState, onChange, onUpdateComplete]);

  const handleReset = useCallback(() => {
    setLocalState({
      keyword: '',
      amount: { min: '', max: '' },
    });
    
    onChange({
      ...queryState,
      transactionType: undefined,
      filters: {
        search: undefined,
        minAmount: undefined,
        maxAmount: undefined,
        month: undefined,
        bankId: undefined,
        split: undefined
      }
    });
    
    onError(null);
    onUpdateComplete?.();
  }, [queryState, onChange, onError, onUpdateComplete]);

  const handleSearchChange = useCallback((value: string) => {
    setLocalState(prev => ({ ...prev, keyword: value }));
    applyFilters({ search: value.trim() || undefined });
  }, [applyFilters]);


  const handleAmountChange = useCallback((type: 'min' | 'max', value: string) => {
    setLocalState(prev => ({
      ...prev,
      amount: { ...prev.amount, [type]: value }
    }));

    const updates = {
      minAmount: type === 'min' 
        ? (value ? Number(value) : undefined) 
        : queryState.filters.minAmount,
      maxAmount: type === 'max' 
        ? (value ? Number(value) : undefined) 
        : queryState.filters.maxAmount
    };

    applyFilters(updates);
  }, [queryState.filters, applyFilters]);

  return {
    localState,
    handleSearchChange,
    handleAmountChange,
    handleTypeChange,
    handleReset,
    applyFilters
  };
};