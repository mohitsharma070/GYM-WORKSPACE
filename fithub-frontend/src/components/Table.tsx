import React from 'react';

interface TableProps<T> {
  headers: string[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
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
}

const Table = <T extends object>({
  headers,
  data,
  renderRow,
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
}: TableProps<T>) => {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg">
      {/* Search Input */}
      {onSearchChange && (
        <div className="p-4 mb-4">
          <input
            type="text"
            placeholder={searchPlaceholder || "Search..."}
            value={searchTerm || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {headers.map((header, index) => (
              <th key={index} scope="col" className="p-4">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td colSpan={headers.length} className="p-4 text-center">
                No data available.
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <React.Fragment key={keyExtractor(item)}>
                <tr
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600`}
                  onClick={() => toggleRow && toggleRow(index)}
                >
                  {renderRow(item, index)}
                </tr>
                {openRowIndex === index && renderExpandedContent && (
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <td colSpan={headers.length} className="p-4">
                      {renderExpandedContent(item, index)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex justify-center items-center space-x-2 p-4">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded-md ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
};

export default Table;
