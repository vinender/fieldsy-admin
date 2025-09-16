import React from 'react';
import { cn } from '@/lib/utils';

// Table Root Component
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

// Table Header
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-gray-50", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

// Table Body
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("bg-white divide-y divide-gray-200", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

// Table Footer
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t bg-gray-50 font-medium", className)}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

// Table Row
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "hover:bg-gray-50 transition-colors data-[state=selected]:bg-gray-100",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

// Table Head Cell
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "px-6 py-3 text-left text-xs font-normal text-table-header tracking-wider",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

// Table Data Cell
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-6 py-4 whitespace-nowrap text-sm", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

// Table Caption
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-xs font-normal text-table-header", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

// Table Container with border and shadow
const TableContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-ash rounded-xl shadow-sm border border-gray-100 overflow-hidden",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
TableContainer.displayName = "TableContainer";

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const TablePagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="px-6 py-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="px-3 py-1 text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Empty State Component
interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
}

const TableEmptyState: React.FC<EmptyStateProps> = ({
  message = "No data available",
  icon,
}) => (
  <div className="text-center py-12">
    {icon && <div className="flex justify-center mb-4">{icon}</div>}
    <p className="text-gray-500">{message}</p>
  </div>
);

// Loading State Component
const TableLoadingState: React.FC = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green"></div>
  </div>
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableContainer,
  TablePagination,
  TableEmptyState,
  TableLoadingState,
};