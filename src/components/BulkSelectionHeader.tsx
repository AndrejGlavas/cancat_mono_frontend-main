import React from "react";
import { TransactionQueryState, Transaction, BulkSelection } from "../utils/types";

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
  tagId: undefined
};

interface BulkSelectionHeaderProps {
  rowData: Transaction[];
  queryState: TransactionQueryState;
  bulkLabelEdit: boolean;
  onChange: (updates: Partial<TransactionQueryState>) => void;
}

export const BulkSelectionHeader: React.FC<BulkSelectionHeaderProps> = ({
  rowData,
  queryState,
  bulkLabelEdit,
  onChange,
}) => {
  const showCheckbox = true;
  const bulkSelection = queryState.bulkSelection || defaultBulkSelection;

  const eligibleTransactions = rowData.filter((t) => {
    if (t.lock) return false;
    if (bulkLabelEdit) return true;

    const hasTypeOperation =
      bulkSelection.isBusinessBulk ||
      bulkSelection.isPersonalBulk;

    if (hasTypeOperation) {
      if (bulkSelection.isBusinessBulk) {
        return !t.business;
      }
      if (bulkSelection.isPersonalBulk) {
        return t.business;
      }
    }

    return true;
  });

  const handleHeaderCheckboxChange = (checked: boolean) => {
    const newSelectedTransactions = checked 
      ? eligibleTransactions.map(t => ({ id: t.id, business: t.business }))
      : [];
    
    const newSelectedIds = checked 
      ? eligibleTransactions.map(t => t.id)
      : [];

    onChange({
      ...queryState,
      bulkSelection: {
        ...bulkSelection,
        selectedTransactions: newSelectedTransactions,
        selectedIds: newSelectedIds,
      }
    });
  };

  return (
    <th className="p-3 text-left">
      {showCheckbox && (
        <input
          type="checkbox"
          checked={
            rowData.length > 0 &&
            bulkSelection.selectedIds.length === eligibleTransactions.length
          }
          onChange={(e) => handleHeaderCheckboxChange(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      )}
    </th>
  );
};

export default BulkSelectionHeader;