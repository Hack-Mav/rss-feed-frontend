import { useState, useCallback, useMemo } from 'react';

interface UsePaginationProps {
  items: any[];
  itemsPerPage?: number;
  initialPage?: number;
}

export const usePagination = ({
  items,
  itemsPerPage = 10,
  initialPage = 1
}: UsePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Calculate pagination values
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    return {
      totalPages,
      startIndex,
      endIndex,
      currentItems,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages
    };
  }, [items, currentPage, itemsPerPage]);

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= paginationData.totalPages) {
      setCurrentPage(page);
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [paginationData.totalPages]);

  const goToNextPage = useCallback(() => {
    if (paginationData.hasNextPage) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, paginationData.hasNextPage, goToPage]);

  const goToPreviousPage = useCallback(() => {
    if (paginationData.hasPreviousPage) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, paginationData.hasPreviousPage, goToPage]);

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(paginationData.totalPages);
  }, [goToPage, paginationData.totalPages]);

  // Reset to first page when items change
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Generate page numbers for pagination controls
  const getPageNumbers = useCallback(() => {
    const { totalPages } = paginationData;
    const delta = 2; // Number of pages to show around current page
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  }, [currentPage, paginationData.totalPages]);

  return {
    currentPage,
    setCurrentPage,
    ...paginationData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    resetPagination,
    getPageNumbers
  };
};
