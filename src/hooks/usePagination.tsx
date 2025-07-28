// hooks/usePagination.ts
import { useCallback, useState } from 'react';



interface UsePaginationProps {
  totalRecords: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const usePagination = ({ 
    totalRecords, 
    itemsPerPage, 
    onPageChange 
  }: UsePaginationProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(totalRecords / itemsPerPage);
  
    const handlePageChange = useCallback((newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        onPageChange(newPage);
      }
    }, [totalPages, onPageChange]);
  
    return {
      currentPage,
      totalPages,
      handlePageChange,
      hasPrevious: currentPage > 1,
      hasNext: currentPage < totalPages
    };
  };