import React from "react";
import { TransactionQueryState, BulkSelection } from "../utils/types";

interface BulkSelectionCellProps {
  transactionId: number;
  isLocked: boolean;
  isBusiness: boolean;
  queryState: TransactionQueryState;
  bulkLabelEdit: boolean;
  onChange: (updates: Partial<TransactionQueryState>) => void;
}

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
  hideData: null
};

export const BulkSelectionCell: React.FC<BulkSelectionCellProps> = ({
  transactionId,
  isLocked,
  isBusiness,
  queryState,
  onChange
}) => {
  const bulkSelection = queryState.bulkSelection || defaultBulkSelection;
  
  const handleCheckboxChange = (checked: boolean) => {
    const currentSelection = bulkSelection.selectedTransactions;
    const currentIds = bulkSelection.selectedIds;
    
    let newSelection;
    let newIds;
    
    if (checked) {
      newSelection = [...currentSelection, { id: transactionId, business: isBusiness }];
      newIds = [...currentIds, transactionId];
    } else {
      newSelection = currentSelection.filter(t => t.id !== transactionId);
      newIds = currentIds.filter(id => id !== transactionId);
    }

    onChange({
      ...queryState,
      bulkSelection: {
        ...bulkSelection,
        selectedTransactions: newSelection,
        selectedIds: newIds,
      }
    });
  };

  return (
    <td className="p-3">
      <input
        type="checkbox"
        disabled={isLocked}
        checked={bulkSelection.selectedIds.includes(transactionId)}
        onChange={(e) => handleCheckboxChange(e.target.checked)}
        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
    </td>
  );
};

export default BulkSelectionCell;