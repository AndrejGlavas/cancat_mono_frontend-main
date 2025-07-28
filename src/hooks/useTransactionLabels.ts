import { useState } from 'react';
import axios from 'axios';
import { transactionsApi } from '../services/transactionsApi';

export const useTransactionLabels = (onUpdate: () => void) => {
  const [editingLabel, setEditingLabel] = useState<number | null>(null);
  const [bulkLabelEdit, setBulkLabelEdit] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [originalLabel, setOriginalLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLabelEdit = (id: number, currentLabel: string) => {
    setEditingLabel(id);
    setNewLabel(currentLabel);
    setOriginalLabel(currentLabel);
  };

  const handleBulkLabelEditStart = () => {
    setBulkLabelEdit(true);
  };

  const handleLabelSave = async () => {
    if (editingLabel === null) return;
    
    setError(null);
    try {
      console.log('Saving label with:', {
        editingLabel,
        newLabel,
        originalLabel
      });

      await transactionsApi.updateLabel(editingLabel, newLabel);
    
      await transactionsApi.addLog( 
        {
          fieldName: "label",
          oldValue: originalLabel,
          newValue: newLabel,
          transactionId: editingLabel,
          method: 'human'
        }
      );
      
      setEditingLabel(null);
      setNewLabel("");
      onUpdate();
    } catch (err) {
      console.error("Error in handleLabelSave:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to update label");
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return {
    editingLabel,
    newLabel,
    setNewLabel,
    handleLabelEdit,
    handleLabelSave,
    error,
    bulkLabelEdit,
    handleBulkLabelEditStart
  };
};