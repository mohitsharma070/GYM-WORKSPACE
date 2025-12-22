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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-800 placeholder-gray-600"
          />
        </div>
      )}

      <table className="w-full text-sm text-left text-gray-700 table-fixed bg-yellow-100 shadow-sm rounded-lg overflow-hidden">
        <thead className="text-sm text-gray-800 uppercase bg-gray-100 font-medium border-b-2 border-green-500">
          <tr>
            {headers.map((header, index) => (
              <th key={index} scope="col" className={`p-4 align-middle ${columnClasses?.[index] || 'text-left'}`}>
                {header}
              </th>
            ))}
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
            data.map((item, index) => (
              <React.Fragment key={keyExtractor(item)}>
                <tr
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 hover:bg-green-50 transition-colors duration-200 cursor-pointer`}
                  onClick={() => toggleRow && toggleRow(index)}
                >
                  {renderCells(item, index).map((cellContent, cellIndex) => (
                    <td key={cellIndex} className={`p-4 align-middle ${columnClasses?.[cellIndex] || 'text-left'}`}>
                      {cellContent}
                    </td>
                  ))}
                </tr>
                {openRowIndex === index && renderExpandedContent && (
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td colSpan={headers.length} className="p-4 align-middle">
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
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {pageNumbers.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
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
