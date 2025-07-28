//utils/filterStore.ts

import { 
  TransactionType, 
  VisibilityPreferences, 
  TransactionFilters,
  TransactionQueryState, 
  SortState,
  BulkOperationType,
  BulkSelection 
} from './types';


const FILTER_STORAGE_KEY = 'transaction_filters';

export const defaultVisibilityPreferences: VisibilityPreferences = {
  showHidden: false,
  showLocked: true,
  showFlagged: true
};

export const defaultFilters: TransactionFilters = {};

export const defaultSort: SortState = {
  column: "date",
  direction: "desc"
};

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
  targetType: undefined,
  label: undefined,
  splitData: null,
  flagData: null,
  lockData: null,
  hideData: null,
  tagCat: undefined,
  tagId: undefined
};

export const defaultState: TransactionQueryState = {
  visibilityPreferences: defaultVisibilityPreferences,
  filters: defaultFilters,
  sort: defaultSort,
  bulkSelection: defaultBulkSelection  
};



export const filterStore = {
  getState(): TransactionQueryState {
    try {
      const stored = localStorage.getItem(FILTER_STORAGE_KEY);
      if (!stored) return defaultState;
      
      const parsed = JSON.parse(stored);
      return this.validateState(parsed) ? parsed : defaultState;
    } catch {
      return defaultState;
    }
  },

  saveState(state: TransactionQueryState) {
    try {
      if (this.validateState(state)) {
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(state));
      }
    } catch (error) {
      console.error('Failed to save filter state:', error);
    }
  },

  validateState(state: any): state is TransactionQueryState {
    if (!state || typeof state !== 'object') return false;
    
    // Validate visibility preferences
    if (!this.validateVisibilityPreferences(state.visibilityPreferences)) {
      return false;
    }

    // Validate transaction type if present
    if (state.transactionType !== undefined && 
        !Object.values(TransactionType).includes(state.transactionType)) {
      return false;
    }

    // Validate filters
    if (!this.validateFilters(state.filters)) {
      return false;
    }

    // Validate sort state
    if (!this.validateSortState(state.sort)) {
      return false;
    }

    // Update bulk selection validation
    if (!this.validateBulkSelection(state.bulkSelection)) {
      return false;
    }

    return true;
  },

  validateBulkSelection(bulkSelection: any): bulkSelection is BulkSelection {
    if (!bulkSelection || typeof bulkSelection !== 'object') return false;
    
    // Validate arrays
    if (!Array.isArray(bulkSelection.selectedIds) || !Array.isArray(bulkSelection.selectedTransactions)) {
      return false;
    }
  
    // Validate boolean flags
    const booleanFlags = [
      'isLabelBulk', 'isBusinessBulk', 'isPersonalBulk', 'isTagBulk',
      'isCategoryBulk', 'isStatusBulk', 'isSplitBulk', 'isFlagBulk',
      'isLockBulk', 'isHideBulk'
    ];
    
    for (const flag of booleanFlags) {
      if (typeof bulkSelection[flag] !== 'boolean') {
        return false;
      }
    }
  
    // Validate nullable boolean data
    const nullableData = ['splitData', 'flagData', 'lockData', 'hideData'];
    for (const field of nullableData) {
      if (bulkSelection[field] !== null && typeof bulkSelection[field] !== 'boolean') {
        return false;
      }
    }
  
    // Validate optional fields
    if (bulkSelection.targetType !== undefined && 
        !Object.values(BulkOperationType).includes(bulkSelection.targetType)) {
      return false;
    }
  
    return true;
  },

  validateVisibilityPreferences(prefs: any): prefs is VisibilityPreferences {
    if (!prefs || typeof prefs !== 'object') return false;
    
    return (
      typeof prefs.showHidden === 'boolean' &&
      typeof prefs.showLocked === 'boolean' &&
      typeof prefs.showFlagged === 'boolean' 
    );
  },

  validateFilters(filters: any): filters is TransactionFilters {
    if (!filters || typeof filters !== 'object') return false;
  
    // Validate search string if present
    if (filters.search !== undefined && typeof filters.search !== 'string') {
      return false;
    }
  
    // Validate amount ranges if present
    if (filters.minAmount !== undefined && typeof filters.minAmount !== 'number') {
      return false;
    }
    if (filters.maxAmount !== undefined && typeof filters.maxAmount !== 'number') {
      return false;
    }
  
    // Validate that min is not greater than max if both exist
    if (filters.minAmount !== undefined && 
        filters.maxAmount !== undefined && 
        filters.minAmount > filters.maxAmount) {
      return false;
    }
  
    // Validate month if present (should be string in format "01"-"12")
    if (filters.month !== undefined) {
      if (typeof filters.month !== 'string') return false;
      const monthNum = parseInt(filters.month, 10);
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) return false;
    }
  
    // Add validation for split
    if (filters.split !== undefined && typeof filters.split !== 'boolean') {
      return false;
    }
  
    return true;
  },

  validateSortState(sort: any): sort is SortState {
    if (!sort || typeof sort !== 'object') return false;

    // Validate sort column
    if (!['date', 'label', 'amount'].includes(sort.column)) {
      return false;
    }

    // Validate sort direction
    if (!['asc', 'desc'].includes(sort.direction)) {
      return false;
    }

    return true;
  },

  clearState() {
    localStorage.removeItem(FILTER_STORAGE_KEY);
  }
};