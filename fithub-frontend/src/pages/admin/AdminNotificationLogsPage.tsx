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
import { ScrollText, BellOff } from 'lucide-react'; // Import the icon and BellOff
import PageHeader from '../../components/PageHeader'; // Import PageHeader
import EmptyState from "../../components/EmptyState"; // Import EmptyState
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Table from "../../components/Table";

export default function AdminNotificationLogsPage() {
  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(10);
  const [filters, setFilters] = useState<NotificationHistoryFilter>({});
  const [sort, setSort] = useState<NotificationHistorySort>({ sortBy: "timestamp", sortOrder: "desc" }); // Changed sentAt to timestamp
  const [searchTerm, setSearchTerm] = useState<string>(''); // New state for search term

  const navigate = useNavigate(); // Initialize navigate

  const { data, isLoading, isError, error, refetch } = useQuery< // Added refetch
    PaginatedResponse<NotificationLogResponse>, // Changed from PromotionalNotificationHistoryItem
    Error
  >({
    queryKey: ["promotionalNotificationHistory", page, size, filters, sort, searchTerm], // Include searchTerm in queryKey
    queryFn: () => getPromotionalNotificationHistory(page, size, { ...filters, searchTerm }, sort), // Pass searchTerm to filters
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0); // Reset to first page on search term change
  };


  if (isLoading) {
    return <div className="p-6">Loading promotional notification logs...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600">
        <EmptyState
          icon={BellOff} // Using BellOff for error state as well, or another appropriate icon
          title="Failed to load notification logs"
          description={error?.message || "An unexpected error occurred while fetching notification logs. Please try again."}
          buttonText="Retry"
          onButtonClick={() => refetch()}
        />
      </div>
    );
  }

  const history = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "SENT":
        return "text-green-600 font-semibold";
      case "FAILED":
        return "text-red-600 font-semibold";
      case "PENDING":
        return "text-yellow-600 font-semibold";
      case "PARTIAL": // Assuming backend might return this status for partial success
        return "text-orange-600 font-semibold";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        icon={ScrollText}
        title="Broadcast Notification Logs"
        subtitle="Review the history of all broadcast notifications sent."
      />

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    {/* Search Input */}
                    <div className="w-full md:w-1/3">
                      <input
                        type="text"
                        placeholder="Search message content or target identifiers..."
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                    </div>        {/* Filters and Sort */}
        <div className="flex flex-wrap gap-4">
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
            <option value="PARTIAL">PARTIAL</option> {/* Added PARTIAL status filter */}
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
          <Table
            headers={[
              "Sent At",
              "Target Type",
              "Message Content",
              "Image",
              "Status",
              "Target Identifiers",
            ]}
            columnClasses={[
              "w-1/6 whitespace-nowrap",
              "w-1/6 whitespace-nowrap",
              "w-2/6 truncate",
              "w-1/12 whitespace-nowrap",
              "w-1/12 whitespace-nowrap",
              "w-1/6 whitespace-nowrap",
            ]}
            data={history}
            renderCells={(item: NotificationLogResponse) => [
              new Date(item.timestamp).toLocaleString(),
              item.targetType,
              <span title={item.messageContent}>{item.messageContent}</span>,
              item.imageUrl ? (
                <a href={item.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  View Image
                </a>
              ) : (
                "N/A"
              ),
              <span className={getStatusClasses(item.status)}>{item.status}</span>,
              item.targetIdentifiers && item.targetIdentifiers.length > 0
                ? item.targetIdentifiers.join(", ")
                : "N/A",
            ]}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search message content or target identifiers..."
            searchTerm={searchTerm}
            onSearchChange={(value) => {
              setSearchTerm(value);
              setPage(0);
            }}
            currentPage={page + 1}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage - 1)}
          />
        </div>
      ) : (
        <EmptyState
          icon={BellOff}
          title="No broadcast logs yet"
          description={searchTerm ? "No results found for your search criteria. Try a different search term." : "Once you send a broadcast notification, its details and status will appear here."}
          buttonText={searchTerm ? "Clear Search" : "Send New Broadcast"}
          onButtonClick={searchTerm ? () => setSearchTerm('') : () => navigate('/admin/promotional-notifications')}
        />
      )}
    </div>
  );
}