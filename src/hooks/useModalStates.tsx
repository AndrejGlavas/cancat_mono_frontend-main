// hooks/useModalStates.ts
import { useState, useCallback } from 'react';
import { TransLog } from '../utils/types';

export const useModalStates = () => {
  // Category Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedTransactionForCategory, setSelectedTransactionForCategory] = useState<number | null>(null);

  // Tag Dialog
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [searchTag, setSearchTag] = useState('');

  // History Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState<TransLog[]>([]);

  const handleCloseAll = useCallback(() => {
    setShowCategoryModal(false);
    setShowTagDialog(false);
    setShowHistoryModal(false);
    setSelectedTransactionForCategory(null);
    setSelectedTransactionId(null);
    setHistoryData([]);
  }, []);

  return {
    // Category Modal
    showCategoryModal,
    setShowCategoryModal,
    selectedTransactionForCategory,
    setSelectedTransactionForCategory,

    // Tag Dialog
    showTagDialog,
    setShowTagDialog,
    selectedTransactionId,
    setSelectedTransactionId,
    searchTag,
    setSearchTag,

    // History Modal
    showHistoryModal,
    setShowHistoryModal,
    historyData,
    setHistoryData,

    // Utilities
    handleCloseAll
  };
};