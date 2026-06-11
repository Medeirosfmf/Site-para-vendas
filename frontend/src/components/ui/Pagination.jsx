import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-dark-600 bg-dark-800 text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700 hover:text-text-primary transition-colors"
      >
        <FiChevronLeft className="w-5 h-5" />
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-10 h-10 rounded-lg border border-dark-600 bg-dark-800 text-text-secondary hover:bg-dark-700 hover:text-text-primary transition-colors"
          >
            1
          </button>
          {startPage > 2 && <span className="text-text-muted">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
            currentPage === page
              ? 'gradient-bg text-white border-transparent'
              : 'border border-dark-600 bg-dark-800 text-text-secondary hover:bg-dark-700 hover:text-text-primary'
          }`}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-text-muted">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-10 h-10 rounded-lg border border-dark-600 bg-dark-800 text-text-secondary hover:bg-dark-700 hover:text-text-primary transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-dark-600 bg-dark-800 text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700 hover:text-text-primary transition-colors"
      >
        <FiChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
