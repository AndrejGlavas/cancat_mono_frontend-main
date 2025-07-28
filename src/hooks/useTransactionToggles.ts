// hooks/useTransactionToggles.ts
import { useCallback } from 'react';
import { TransactionQueryState, VisibilityPreferences } from '../utils/types';

export const useTransactionToggles = (
  queryState: TransactionQueryState,
  onChange: (state: Partial<TransactionQueryState>) => void,
  onUpdateComplete?: () => void
) => {
  const handleVisibilityToggle = useCallback((key: keyof VisibilityPreferences) => {
    const newVisibilityPreferences = {
      ...queryState.visibilityPreferences,
      [key]: !queryState.visibilityPreferences[key]
    };

    onChange({
      ...queryState,
      visibilityPreferences: newVisibilityPreferences
    });

    onUpdateComplete?.();
  }, [queryState, onChange, onUpdateComplete]);

  return {
    visibilityPreferences: queryState.visibilityPreferences,
    handleVisibilityToggle
  };
};