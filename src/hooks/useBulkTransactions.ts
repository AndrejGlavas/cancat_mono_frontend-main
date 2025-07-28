import { useState, useCallback } from "react";
import {
  BulkOperationType,
  TransactionQueryState,
  BulkUpdateParams,
  BulkSelection,
} from "../utils/types";
import { transactionsApi } from "../services/transactionsApi";

const defaultBulkSelection: BulkSelection = {
  selectedIds: [],
  selectedTransactions: [],
  isLabelBulk: false,
  isBusinessBulk: false,
  isPersonalBulk: false,
  isTagBulk: false,
  isCategoryBulk: false,
  isStatusBulk: false,
  isSplitBulk: false,
  isFlagBulk: false,
  isLockBulk: false,
  isHideBulk: false,
  splitData: null,
  flagData: null,
  lockData: null,
  hideData: null,
  targetType: undefined,
  label: undefined,
  tagCat: undefined,
  tagId: undefined,
};

interface UseBulkTransactionsProps {
  queryState: TransactionQueryState;
  onChange: (state: Partial<TransactionQueryState>) => void;
  onUpdateComplete?: () => void;
  onError?: (error: string) => void;
}

export const useBulkTransactions = ({
  queryState,
  onChange,
  onUpdateComplete,
  onError,
}: UseBulkTransactionsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const clearBulkSelection = useCallback(() => {
    onChange({
      ...queryState,
      bulkSelection: defaultBulkSelection,
    });
  }, [queryState, onChange]);

  const handleBulkOperationClick = useCallback(
    (
      type: BulkOperationType,
      value: boolean,
      data?: string | object | boolean | null
    ) => {
      const currentBulkSelection = queryState.bulkSelection || defaultBulkSelection;
      const updates = {
        ...currentBulkSelection,
        targetType: type,
      };

      switch (type) {
        case "LABEL":
          updates.isLabelBulk = value;
          updates.label = data as string;
          break;
        case "BUSINESS":
          updates.isBusinessBulk = value;
          updates.isPersonalBulk = false;
          break;
        case "PERSONAL":
          updates.isPersonalBulk = value;
          updates.isBusinessBulk = false;
          break;
        case "SPLIT":
          updates.isSplitBulk = value;
          updates.splitData = data as boolean;
          break;
        case "FLAG":
          updates.isFlagBulk = value;
          updates.flagData = data as boolean;
          break;
        case "LOCK":
          updates.isLockBulk = value;
          updates.lockData = data as boolean;
          break;
        case "HIDE":
          updates.isHideBulk = value;
          updates.hideData = data as boolean;
          break;
        case "TAG":
          updates.isTagBulk = value;
          updates.tagCat = (data as any)?.type || null;
          updates.tagId = (data as any)?.tag || null;
          break;
        case "CATEGORY":
          updates.isCategoryBulk = value;
          break;
        case "STATUS":
          updates.isStatusBulk = value;
          break;
      }

      onChange({
        ...queryState,
        bulkSelection: updates,
      });
    },
    [queryState, onChange]
  );

  const handleBulkOperation = useCallback(
    async (params: BulkUpdateParams) => {
      if (!params.transactionIds.length) {
        console.warn("No transactions selected");
        return;
      }

      setIsUpdating(true);
      try {
        const response = await transactionsApi.bulkUpdate(params);
        if (response.status === "success") {
          clearBulkSelection();
          onUpdateComplete?.();
        } else {
          throw new Error(response.message || "Bulk update failed");
        }
      } catch (error) {
        console.error("Bulk operation error:", error);
        onError?.(
          error instanceof Error
            ? error.message
            : "Failed to update transactions"
        );
      } finally {
        setIsUpdating(false);
      }
    },
    [clearBulkSelection, onUpdateComplete, onError]
  );

  const handleBulkTypeUpdate = useCallback(
    (type: BulkOperationType) => {
      const bulkSelection = queryState.bulkSelection || defaultBulkSelection;
      if (!bulkSelection.selectedIds.length) return;

      const data: Record<string, any> = {};
      const operations = {
        isLabelBulk: { field: 'label', value: bulkSelection.label },
        isBusinessBulk: { field: 'business', value: true },
        isPersonalBulk: { field: 'business', value: false },
        isTagBulk: { field: 'tagId', value: bulkSelection.tagId },
        isSplitBulk: { field: 'split', value: bulkSelection.splitData },
        isFlagBulk: { field: 'flag', value: bulkSelection.flagData },
        isLockBulk: { field: 'lock', value: bulkSelection.lockData },
        isHideBulk: { field: 'hide', value: bulkSelection.hideData },
      };

      Object.entries(operations).forEach(([key, { field, value }]) => {
        if (bulkSelection[key as keyof BulkSelection]) {
          data[field] = value;
        }
      });

      handleBulkOperation({
        transactionIds: bulkSelection.selectedIds,
        operation: type,
        data,
      });
    },
    [queryState.bulkSelection, handleBulkOperation]
  );

  const handleBulkLabelUpdate = useCallback(
    (label: string) => {
      const bulkSelection = queryState.bulkSelection || defaultBulkSelection;
      if (!bulkSelection.selectedIds.length) return;

      handleBulkOperation({
        transactionIds: bulkSelection.selectedIds,
        operation: BulkOperationType.LABEL,
        data: { label },
      });
    },
    [queryState.bulkSelection, handleBulkOperation]
  );

  const handleBulkTagUpdate = useCallback(
    (tagId: number) => {
      const bulkSelection = queryState.bulkSelection || defaultBulkSelection;
      if (!bulkSelection.selectedIds.length) return;

      handleBulkOperation({
        transactionIds: bulkSelection.selectedIds,
        operation: BulkOperationType.TAG,
        data: { tagId },
      });
    },
    [queryState.bulkSelection, handleBulkOperation]
  );

  const handleBulkStatusUpdate = useCallback(
    (statusType: "flag" | "lock" | "hidden" | "split", value: boolean) => {
      const bulkSelection = queryState.bulkSelection || defaultBulkSelection;
      if (!bulkSelection.selectedIds.length) return;

      handleBulkOperation({
        transactionIds: bulkSelection.selectedIds,
        operation: BulkOperationType.STATUS,
        data: { [statusType]: value },
      });
    },
    [queryState.bulkSelection, handleBulkOperation]
  );

  return {
    isUpdating,
    handleBulkOperationClick,
    clearBulkSelection,
    handleBulkTypeUpdate,
    handleBulkLabelUpdate,
    handleBulkTagUpdate,
    handleBulkStatusUpdate,
  };
};