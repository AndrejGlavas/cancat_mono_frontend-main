// hooks/useTransactionCategories.ts
import { useState, useCallback } from "react";
import { TransactionType, TransactionQueryState } from "../utils/types";
import { transactionsApi } from "../services/transactionsApi";

interface UseTransactionCategoriesProps {
  queryState: TransactionQueryState;
  onChange: (state: Partial<TransactionQueryState>) => void;
  onUpdateComplete?: () => void;
  onError?: (error: string) => void;
}

export const useTransactionCategories = ({
  queryState,
  onChange,
  onUpdateComplete,
  onError,
}: UseTransactionCategoriesProps) => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null);

  // For filtering
  const handleFilterTypeChange = useCallback(
    (newType: TransactionType) => {
      onChange({
        ...queryState,
        transactionType: newType,
      });
    },
    [queryState, onChange]
  );

  // For business/personal toggle
  const handleTransactionTypeChange = useCallback(
    async (transactionId: number, newType: TransactionType) => {
      try {
        await Promise.all([
          transactionsApi.updateCategory(transactionId, {
            business: newType === TransactionType.BUSINESS,
            flag: false,
            lock: false,
            hidden: false,
            split: false,
          }),
          transactionsApi.addLog({
            transactionId,
            fieldName: "business",
            oldValue:
              newType === TransactionType.BUSINESS ? "personal" : "business",
            newValue:
              newType === TransactionType.BUSINESS ? "business" : "personal",
            method: "human",
          }),
        ]);
        onUpdateComplete?.();
      } catch (error) {
        onError?.(
          error instanceof Error
            ? error.message
            : "Failed to update transaction type"
        );
      }
    },
    [onUpdateComplete, onError]
  );

  // For flag/hidden/lock toggles
  const handleStatusToggle = useCallback(
    async (
      transactionId: number,
      field: "flag" | "hidden" | "lock" | "split",
      transaction: any
    ) => {
      console.log(transactionId, field, transaction);
      try {
        await Promise.all([
          transactionsApi.updateCategory(transactionId, {
            business: transaction.business,
            flag: field === "flag" ? !transaction.flag : transaction.flag,
            lock: field === "lock" ? !transaction.lock : transaction.lock,
            hidden:
              field === "hidden" ? !transaction.hidden : transaction.hidden,
            split: field === "split" ? !transaction.split : transaction.split,
            income: transaction.income,
            deposit: transaction.deposit,
            expense: transaction.expense,
          }),
          transactionsApi.addLog({
            transactionId,
            fieldName: field,
            oldValue: String(transaction[field]),
            newValue: String(!transaction[field]),
            method: "human",
          }),
        ]);
        onUpdateComplete?.();
      } catch (error) {
        onError?.(
          error instanceof Error
            ? error.message
            : "Failed to update transaction status"
        );
      }
    },
    [onUpdateComplete, onError]
  );

  const handleCategoryClick = useCallback((transactionId: number) => {
    setSelectedTransactionId(transactionId);
    setShowCategoryModal(true);
  }, []);

  return {
    showCategoryModal,
    setShowCategoryModal,
    selectedTransactionId,
    setSelectedTransactionId,
    handleCategoryClick,
    handleFilterTypeChange,
    handleTransactionTypeChange,
    handleStatusToggle,
  };
};
