import React, { useState } from 'react';
import { FiSearch, FiInbox } from 'react-icons/fi';
import Pagination from '../ui/Pagination';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  onSearch,
  searchPlaceholder = 'Buscar...',
  actions,
  emptyMessage = 'Nenhum dado encontrado',
  pagination,
}) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchValue);
    }
  };

  const handleClearSearch = () => {
    setSearchValue('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className="glass-card overflow-hidden border border-dark-600 rounded-2xl">
      {/* Search Header */}
      {onSearch && (
        <div className="p-4 sm:p-6 border-b border-dark-600 flex flex-col sm:flex-row items-center gap-4 bg-dark-800/20">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
              <FiSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-text-muted hover:text-white transition-colors"
              >
                Limpar
              </button>
            )}
          </form>
        </div>
      )}

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-dark-600 text-left text-sm">
          <thead className="bg-dark-800 font-semibold text-text-secondary uppercase tracking-wider text-xs border-b border-dark-600">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 whitespace-nowrap text-right">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-600 bg-dark-850/20">
            {loading ? (
              // Shimmer skeletal rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-dark-700 rounded w-2/3" />
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="h-8 bg-dark-700 rounded-lg w-16 ml-auto" />
                    </td>
                  )}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty state inside table
              <tr>
                <td 
                  colSpan={columns.length + (actions ? 1 : 0)} 
                  className="px-6 py-12 text-center text-text-secondary"
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <FiInbox className="w-10 h-10 text-text-muted opacity-40" />
                    <p className="text-base font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data rows
              data.map((row, rIdx) => (
                <tr 
                  key={row.id || rIdx} 
                  className="hover:bg-dark-750/30 transition-colors duration-200"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 sm:p-6 border-t border-dark-600 flex items-center justify-between bg-dark-800/10">
          <div className="text-xs text-text-secondary hidden sm:block">
            Página <span className="font-semibold text-white">{pagination.currentPage}</span> de{' '}
            <span className="font-semibold text-white">{pagination.totalPages}</span>
          </div>
          <div className="w-full sm:w-auto">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.onPageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
