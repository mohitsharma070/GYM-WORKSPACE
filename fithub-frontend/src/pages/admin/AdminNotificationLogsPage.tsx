import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getPromotionalNotificationHistory,
  type PaginatedResponse,
  type NotificationLogResponse, // Changed from PromotionalNotificationHistoryItem
  type NotificationHistoryFilter,
  type NotificationHistorySort,
} from "../../api/notifications";
import { TargetType } from "../../types/TargetType"; // Import TargetType

export default function AdminNotificationLogsPage() {
  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(10);
  const [filters, setFilters] = useState<NotificationHistoryFilter>({});
  const [sort, setSort] = useState<NotificationHistorySort>({ sortBy: "timestamp", sortOrder: "desc" }); // Changed sentAt to timestamp

  const { data, isLoading, isError, error } = useQuery<
    PaginatedResponse<NotificationLogResponse>, // Changed from PromotionalNotificationHistoryItem
    Error
  >({
    queryKey: ["promotionalNotificationHistory", page, size, filters, sort],
    queryFn: () => getPromotionalNotificationHistory(page, size, filters, sort),
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value === "" ? undefined : (e.target.name === "targetType" ? e.target.value as TargetType : e.target.value) });
    setPage(0); // Reset to first page on filter change
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split("_");
    setSort({ sortBy: sortBy as NotificationHistorySort["sortBy"], sortOrder: sortOrder as NotificationHistorySort["sortOrder"] });
    setPage(0); // Reset to first page on sort change
  };

  if (isLoading) {
    return <div className="p-6">Loading promotional notification logs...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-600">Error: {error?.message || "Failed to fetch notification logs"}</div>;
  }

  const history = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[var(--color-text)]">Promotional Notification Logs</h1>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <select
            name="targetType"
            onChange={handleFilterChange}
            value={filters.targetType || ""}
            className="p-2 border rounded-md"
          >
            <option value="">All Target Types</option>
            {Object.values(TargetType).map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <select
            name="status"
            onChange={handleFilterChange}
            value={filters.status || ""}
            className="p-2 border rounded-md"
          >
            <option value="">All Statuses</option>
            <option value="SENT">SENT</option>
            <option value="FAILED">FAILED</option>
            <option value="PENDING">PENDING</option>
          </select>

          <select
            name="sort"
            onChange={handleSortChange}
            value={`${sort.sortBy}_${sort.sortOrder}`}
            className="p-2 border rounded-md"
          >
            <option value="timestamp_desc">Sent At (Newest First)</option> {/* Changed sentAt to timestamp */}
            <option value="timestamp_asc">Sent At (Oldest First)</option> {/* Changed sentAt to timestamp */}
            <option value="status_asc">Status (A-Z)</option>
            <option value="status_desc">Status (Z-A)</option>
            <option value="targetType_asc">Target Type (A-Z)</option>
            <option value="targetType_desc">Target Type (Z-A)</option>
          </select>
        </div>
      </div>

      {history.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent At
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message Content
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Identifiers
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(item.timestamp).toLocaleString()} {/* Changed sentAt to timestamp */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.targetType}</td>
                  <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-500" title={item.messageContent}> {/* Changed message to messageContent */}
                    {item.messageContent} {/* Changed message to messageContent */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.imageUrl ? (
                      <a href={item.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View Image
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.targetIdentifiers && item.targetIdentifiers.length > 0
                      ? item.targetIdentifiers.join(", ")
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">No promotional notification logs found.</p>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          disabled={page === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
        >
          Previous
        </button>
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
          disabled={page >= totalPages - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}