import React, { useState, useMemo } from 'react';
import { ChevronDown, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

// Status badge component
const StatusBadge = ({ status, statusConfig }) => {
  const config = statusConfig[status] || statusConfig.default;
  
  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-1.5 text-xs font-medium rounded-full border ${config.className}`}>
      {config.label}
    </span>
  );
};

// Reusable Table Component
const DataTable = ({
  data = [],
  columns = [],
  onRowSelect,
  onSelectAll,
  selectedRows = [],
  onRowAction,
  actionLabel = 'View Detail',
  showCheckbox = true,
  showPagination = true,
  itemsPerPage = 10,
  totalItems,
  currentPage = 1,
  onPageChange,
  className = ''
}) => {
  const [localSelectedRows, setLocalSelectedRows] = useState([]);
  const [localCurrentPage, setLocalCurrentPage] = useState(1);
  
  // Use external or internal state for selection
  const activeSelectedRows = onRowSelect ? selectedRows : localSelectedRows;
  const setActiveSelectedRows = onRowSelect ? 
    (rows) => onSelectAll && onSelectAll(rows) : 
    setLocalSelectedRows;
  
  // Use external or internal pagination
  const activePage = onPageChange ? currentPage : localCurrentPage;
  const setActivePage = onPageChange ? onPageChange : setLocalCurrentPage;
  
  // Calculate pagination
  const totalPages = Math.ceil((totalItems || data.length) / itemsPerPage);
  const paginatedData = showPagination 
    ? data.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage)
    : data;
  
  const selectAll = activeSelectedRows.length === data.length;

  const handleSelectAll = () => {
    if (selectAll) {
      setActiveSelectedRows([]);
    } else {
      setActiveSelectedRows(data.map(row => row.id));
    }
  };

  const handleSelectRow = (id) => {
    if (onRowSelect) {
      onRowSelect(id);
    } else {
      if (activeSelectedRows.includes(id)) {
        setLocalSelectedRows(activeSelectedRows.filter(rowId => rowId !== id));
      } else {
        setLocalSelectedRows([...activeSelectedRows, id]);
      }
    }
  };

  const renderCellContent = (row, column) => {
    // Handle custom render function
    if (column.render) {
      return column.render(row[column.key], row);
    }
    
    // Handle nested properties (e.g., "user.name")
    const keys = column.key.split('.');
    let value = row;
    for (const key of keys) {
      value = value?.[key];
    }
    
    // Format based on type
    if (column.type === 'currency') {
      return `$${value}`;
    }
    if (column.type === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    return value;
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-black/10 overflow-hidden ${className}`}>
      {/* Table Header */}
      <div className="bg-[#ebebeb] px-6 py-3">
        <div className="flex items-center gap-6">
          {showCheckbox && (
            <div className="w-6">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
            </div>
          )}
          {columns.map((column) => (
            <div 
              key={column.key} 
              className={`text-xs text-[#575757] font-normal ${column.className || ''}`}
              style={{ width: column.width || 'auto' }}
            >
              {column.header}
            </div>
          ))}
          {onRowAction && (
            <div className="w-[88px] text-xs text-[#575757] font-normal">Action</div>
          )}
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-100">
        {paginatedData.map((row) => (
          <div key={row.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-6">
              {showCheckbox && (
                <div className="w-6">
                  <input
                    type="checkbox"
                    checked={activeSelectedRows.includes(row.id)}
                    onChange={() => handleSelectRow(row.id)}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>
              )}
              {columns.map((column) => (
                <div 
                  key={column.key} 
                  className={column.className || ''}
                  style={{ width: column.width || 'auto' }}
                >
                  {renderCellContent(row, column)}
                </div>
              ))}
              {onRowAction && (
                <div className="w-[88px]">
                  <button 
                    onClick={() => onRowAction(row)}
                    className="px-2.5 py-1.5 bg-[#3a6b22] text-white text-xs font-semibold rounded-full hover:bg-[#2d5419] transition-colors"
                  >
                    {actionLabel}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-[#192215]">
              Showing {((activePage - 1) * itemsPerPage) + 1}-{Math.min(activePage * itemsPerPage, totalItems || data.length)} of {totalItems || data.length}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActivePage(Math.max(1, activePage - 1))}
                disabled={activePage === 1}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              
              {/* Dynamic page numbers */}
              {(() => {
                const pages = [];
                const maxVisible = 5;
                let start = Math.max(1, activePage - Math.floor(maxVisible / 2));
                let end = Math.min(totalPages, start + maxVisible - 1);
                
                if (end - start < maxVisible - 1) {
                  start = Math.max(1, end - maxVisible + 1);
                }
                
                if (start > 1) {
                  pages.push(
                    <button key={1} onClick={() => setActivePage(1)} className="w-8 h-8 flex items-center justify-center rounded text-sm font-medium hover:bg-gray-100 text-gray-700">
                      1
                    </button>
                  );
                  if (start > 2) {
                    pages.push(<span key="dots1" className="px-1">...</span>);
                  }
                }
                
                for (let i = start; i <= end; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setActivePage(i)}
                      className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                        activePage === i
                          ? 'bg-[#3a6b22] text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
                
                if (end < totalPages) {
                  if (end < totalPages - 1) {
                    pages.push(<span key="dots2" className="px-1">...</span>);
                  }
                  pages.push(
                    <button key={totalPages} onClick={() => setActivePage(totalPages)} className="w-8 h-8 flex items-center justify-center rounded text-sm font-medium hover:bg-gray-100 text-gray-700">
                      {totalPages}
                    </button>
                  );
                }
                
                return pages;
              })()}
              
              <button
                onClick={() => setActivePage(Math.min(totalPages, activePage + 1))}
                disabled={activePage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};