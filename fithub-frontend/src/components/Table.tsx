import React from 'react';
import { Button } from './Button';

interface TableProps<T> {
  headers: string[];
  columnClasses?: string[]; // New prop for column-specific Tailwind classes
  data: T[];
  renderCells: (item: T, index: number) => React.ReactNode[]; // Changed from renderRow
  renderExpandedContent?: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  openRowIndex?: number | null;
  toggleRow?: (index: number) => void;
  // Search props
  searchPlaceholder?: string;
  searchTerm?: string;
  onSearchChange?: (searchTerm: string) => void;
  // Pagination props
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  totalItems?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  sortableColumns?: Record<number, string>;
  onSortChange?: (sortBy: string, sortDir: "asc" | "desc") => void;
}

const Table = <T extends object>({
  headers,
  columnClasses, // Destructure new prop
  data,
  renderCells, // Destructure new prop
  renderExpandedContent,
  keyExtractor,
  openRowIndex,
  toggleRow,
  searchPlaceholder,
  searchTerm,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  totalItems,
  sortBy,
  sortDir,
  sortableColumns,
  onSortChange,
}: TableProps<T>) => {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg">
      {/* Search & page size */}
      {(onSearchChange || onPageSizeChange) && (
        <div className="flex flex-col gap-3 p-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
          {onSearchChange && (
            <input
              type="text"
              placeholder={searchPlaceholder || "Search..."}
              value={searchTerm || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-800 placeholder-gray-600 sm:max-w-md"
            />
          )}
          {onPageSizeChange && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>Rows per page</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {(pageSizeOptions || [10, 20, 50]).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {typeof totalItems === "number" && (
                <span className="text-gray-500">of {totalItems}</span>
              )}
            </div>
          )}
        </div>
      )}

      <table className="w-full text-sm text-left text-gray-700 table-fixed bg-yellow-100 shadow-sm rounded-lg overflow-hidden">
        <thead className="text-sm text-gray-800 uppercase bg-gray-100 font-medium border-b-2 border-green-500">
          <tr>
            {headers.map((header, index) => {
              const columnKey = sortableColumns?.[index];
              const isActive = columnKey && sortBy === columnKey;
              const nextDir = isActive && sortDir === "asc" ? "desc" : "asc";

              return (
                <th
                  key={index}
                  scope="col"
                  className={`p-4 align-middle ${columnClasses?.[index] || 'text-left'}`}
                >
                  {columnKey && onSortChange ? (
                    <button
                      type="button"
                      className="flex items-center gap-2 font-semibold text-gray-800 hover:text-green-700"
                      onClick={() => onSortChange(columnKey, nextDir)}
                    >
                      <span>{header}</span>
                      <span className="text-xs">
                        {isActive ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
                      </span>
                    </button>
                  ) : (
                    header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr className="bg-white border-b border-gray-200">
              <td colSpan={headers.length} className="p-4 text-center align-middle text-gray-600">
                No data available.
              </td>
            </tr>
          ) : (
            data.flatMap((item, index) => {
              const key = keyExtractor(item);
              if (key === undefined || key === null) {
                // eslint-disable-next-line no-console
                console.error('Table: keyExtractor returned invalid key', { item, index });
              }
              let cells: React.ReactNode[] = [];
              try {
                cells = renderCells(item, index);
              } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Table: renderCells threw error', { item, index, error: e });
                cells = Array(headers.length).fill(<span className="text-red-500">Error rendering row</span>);
              }
              if (!Array.isArray(cells) || cells.length !== headers.length) {
                // eslint-disable-next-line no-console
                console.error('Table: renderCells returned wrong number of cells', { item, index, cells, expected: headers.length });
                cells = Array(headers.length).fill(<span className="text-red-500">Cell count mismatch</span>);
              }
              if (cells.some(cell => cell === undefined || cell === null)) {
                // eslint-disable-next-line no-console
                console.error('Table: renderCells returned undefined/null cell', { item, index, cells });
              }
              const rows = [
                <tr
                  key={key}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 hover:bg-green-50 transition-colors duration-200 cursor-pointer`}
                  onClick={() => toggleRow && toggleRow(index)}
                >
                  {cells.map((cellContent, cellIndex) => (
                    <td key={cellIndex} className={`p-4 align-middle ${columnClasses?.[cellIndex] || 'text-left'}`}>
                      {cellContent}
                    </td>
                  ))}
                </tr>
              ];
              if (openRowIndex === index && renderExpandedContent) {
                rows.push(
                  <tr key={key + '-expanded'} className="bg-gray-50 border-b border-gray-200">
                    <td colSpan={headers.length} className="p-4 align-middle">
                      {renderExpandedContent(item, index)}
                    </td>
                  </tr>
                );
              }
              return rows;
            })
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex flex-col items-center gap-3 p-4 sm:flex-row sm:justify-center sm:space-x-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex flex-wrap justify-center gap-2">
            {pageNumbers.map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
};

export default Table;
