import { useCallback } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  getPageNumbers: () => (number | string)[];
}

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  goToPreviousPage,
  goToNextPage,
  goToFirstPage,
  goToLastPage,
  hasNextPage,
  hasPreviousPage,
  getPageNumbers
}: PaginationProps) => {
  const handlePageClick = useCallback((page: number | string) => {
    if (typeof page === 'number') {
      onPageChange(page);
    }
  }, [onPageChange]);

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="pagination-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      padding: '2rem 0',
      borderTop: '1px solid #dee2e6',
      marginTop: '2rem'
    }}>
      {/* Items info */}
      <div style={{ fontSize: '0.875rem', color: '#666' }}>
        Showing {startItem}-{endItem} of {totalItems} items
      </div>

      {/* Pagination controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* First page button */}
        <button
          onClick={goToFirstPage}
          disabled={!hasPreviousPage}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #ddd',
            backgroundColor: hasPreviousPage ? 'white' : '#f8f9fa',
            color: hasPreviousPage ? '#007bff' : '#6c757d',
            borderRadius: '4px',
            cursor: hasPreviousPage ? 'pointer' : 'not-allowed',
            fontSize: '0.875rem'
          }}
          title="First page"
        >
          « First
        </button>

        {/* Previous page button */}
        <button
          onClick={goToPreviousPage}
          disabled={!hasPreviousPage}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #ddd',
            backgroundColor: hasPreviousPage ? 'white' : '#f8f9fa',
            color: hasPreviousPage ? '#007bff' : '#6c757d',
            borderRadius: '4px',
            cursor: hasPreviousPage ? 'pointer' : 'not-allowed',
            fontSize: '0.875rem'
          }}
          title="Previous page"
        >
          ‹ Previous
        </button>

        {/* Page numbers */}
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => handlePageClick(page)}
              disabled={typeof page === 'string'}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid #ddd',
                backgroundColor: 
                  typeof page === 'string' ? 'transparent' :
                  page === currentPage ? '#007bff' : 'white',
                color: 
                  typeof page === 'string' ? '#6c757d' :
                  page === currentPage ? 'white' : '#007bff',
                borderRadius: '4px',
                cursor: typeof page === 'string' ? 'default' : 'pointer',
                fontSize: '0.875rem',
                minWidth: '2.5rem',
                fontWeight: page === currentPage ? 'bold' : 'normal'
              }}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next page button */}
        <button
          onClick={goToNextPage}
          disabled={!hasNextPage}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #ddd',
            backgroundColor: hasNextPage ? 'white' : '#f8f9fa',
            color: hasNextPage ? '#007bff' : '#6c757d',
            borderRadius: '4px',
            cursor: hasNextPage ? 'pointer' : 'not-allowed',
            fontSize: '0.875rem'
          }}
          title="Next page"
        >
          Next ›
        </button>

        {/* Last page button */}
        <button
          onClick={goToLastPage}
          disabled={!hasNextPage}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #ddd',
            backgroundColor: hasNextPage ? 'white' : '#f8f9fa',
            color: hasNextPage ? '#007bff' : '#6c757d',
            borderRadius: '4px',
            cursor: hasNextPage ? 'pointer' : 'not-allowed',
            fontSize: '0.875rem'
          }}
          title="Last page"
        >
          Last »
        </button>
      </div>

      {/* Page jump input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
        <span>Go to page:</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          defaultValue={currentPage}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const page = parseInt((e.target as HTMLInputElement).value);
              if (page >= 1 && page <= totalPages) {
                onPageChange(page);
              }
            }
          }}
          style={{
            width: '60px',
            padding: '0.25rem 0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}
        />
        <span>of {totalPages}</span>
      </div>
    </div>
  );
};

export default Pagination;
