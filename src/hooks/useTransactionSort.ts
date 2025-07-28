import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

type SortColumn = "date" | "label" | "amount";
type SortDirection = "asc" | "desc";

interface SortState {
  column: SortColumn;
  direction: SortDirection;
}

interface UseTransactionSortProps {
  onSortChange?: (sortState: SortState) => void;
}

// Validate sort column
const isValidSortColumn = (column: string | null): column is SortColumn => {
  return column === "date" || column === "label" || column === "amount";
};

// Validate sort direction
const isValidSortDirection = (direction: string | null): direction is SortDirection => {
  return direction === "asc" || direction === "desc";
};

export const useTransactionSort = (
  initialColumn: SortColumn = "date",
  { onSortChange }: UseTransactionSortProps = {}
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [sortState, setSortState] = useState<SortState>(() => {
    const urlColumn = searchParams.get('sortColumn');
    const urlDirection = searchParams.get('sortDirection');

    return {
      column: isValidSortColumn(urlColumn) ? urlColumn : initialColumn,
      direction: isValidSortDirection(urlDirection) ? urlDirection : "desc"
    };
  });

  // Update URL when sort changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    
    // Ensure we're setting valid values
    if (isValidSortColumn(sortState.column)) {
      newParams.set('sortColumn', sortState.column);
    }
    if (isValidSortDirection(sortState.direction)) {
      newParams.set('sortDirection', sortState.direction);
    }
    
    setSearchParams(newParams, { replace: true });
    
    // Notify parent component of sort changes
    onSortChange?.(sortState);
  }, [sortState, setSearchParams, searchParams, onSortChange]);

  const handleSort = useCallback((column: SortColumn) => {
    setSortState(currentState => ({
      column,
      direction: 
        column === currentState.column && currentState.direction === "asc" 
          ? "desc" 
          : "asc"
    }));
  }, []);

  return {
    sortColumn: sortState.column,
    sortDirection: sortState.direction,
    handleSort,
    getSortParams: () => ({
      sortColumn: sortState.column,
      sortDirection: sortState.direction
    })
  };
};