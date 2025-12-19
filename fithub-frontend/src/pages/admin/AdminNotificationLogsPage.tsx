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
import { ScrollText, BellOff, Filter, Search, BarChart3, Send, CheckCircle, XCircle, Clock, AlertTriangle, Image } from 'lucide-react'; // Import the icon and BellOff
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
    return (
      <div className="space-y-8">
        <PageHeader
          icon={ScrollText}
          title="Broadcast Logs"
          subtitle="Track delivery status and history of all broadcast notifications."
        />
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-8">
        <PageHeader
          icon={ScrollText}
          title="Broadcast Logs"
          subtitle="Track delivery status and history of all broadcast notifications."
        />
        
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <EmptyState
            icon={BellOff}
            title="Failed to load notification logs"
            description={error?.message || "An unexpected error occurred while fetching notification logs. Please try again."}
            buttonText="Try Again"
            onButtonClick={() => refetch()}
          />
        </div>
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SENT":
        return CheckCircle;
      case "FAILED":
        return XCircle;
      case "PENDING":
        return Clock;
      case "PARTIAL":
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getStatusCount = (status: string) => {
    return history.filter(item => item.status === status).length;
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={ScrollText}
        title="Broadcast Logs"
        subtitle="Track delivery status and history of all broadcast notifications."
      />

      {/* Stats Overview */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Sent</p>
                <p className="text-2xl font-bold text-green-600">{getStatusCount('SENT')}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="text-green-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-600">{getStatusCount('FAILED')}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle className="text-red-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{getStatusCount('PENDING')}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="text-yellow-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900">{history.length}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-full">
                <BarChart3 className="text-gray-600" size={20} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-lg border mb-6">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <h3 className="font-medium text-gray-900">Filters & Search</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search message content or target identifiers..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                name="targetType"
                onChange={handleFilterChange}
                value={filters.targetType || ""}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors"
              >
                <option value="">All Audiences</option>
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors"
              >
                <option value="">All Statuses</option>
                <option value="SENT">✓ Sent</option>
                <option value="FAILED">✗ Failed</option>
                <option value="PENDING">⏳ Pending</option>
                <option value="PARTIAL">⚠ Partial</option>
              </select>

              <select
                name="sort"
                onChange={handleSortChange}
                value={`${sort.sortBy}_${sort.sortOrder}`}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors"
              >
                <option value="timestamp_desc">Latest First</option>
                <option value="timestamp_asc">Oldest First</option>
                <option value="status_asc">Status A-Z</option>
                <option value="status_desc">Status Z-A</option>
                <option value="targetType_asc">Audience A-Z</option>
                <option value="targetType_desc">Audience Z-A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {history.length > 0 ? (
        <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
          <Table
            headers={[
              "Sent At",
              "Audience",
              "Message Content",
              "Media",
              "Status",
              "Recipients",
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
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {new Date(item.timestamp).toLocaleDateString()}
                </div>
                <div className="text-gray-500">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>,
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {item.targetType.replace(/_/g, ' ')}
              </span>,
              <div className="max-w-xs">
                <span 
                  title={item.messageContent}
                  className="text-sm text-gray-900 line-clamp-2 break-words"
                >
                  {item.messageContent}
                </span>
              </div>,
              item.imageUrl ? (
                <a 
                  href={item.imageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                >
                  <Image size={14} />
                  View
                </a>
              ) : (
                <span className="text-gray-400 text-sm">None</span>
              ),
              <div className="flex items-center gap-2">
                {(() => {
                  const StatusIcon = getStatusIcon(item.status);
                  return (
                    <>
                      <StatusIcon size={16} className={getStatusClasses(item.status).replace('font-semibold', '')} />
                      <span className={`text-sm ${getStatusClasses(item.status)}`}>
                        {item.status}
                      </span>
                    </>
                  );
                })()}
              </div>,
              <div className="text-sm text-gray-600">
                {item.targetIdentifiers && item.targetIdentifiers.length > 0
                  ? `${item.targetIdentifiers.length} recipient${item.targetIdentifiers.length > 1 ? 's' : ''}`
                  : "Auto-targeted"}
              </div>,
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
        <div className="bg-white rounded-lg border">
          <EmptyState
            icon={searchTerm ? Search : Send}
            title={searchTerm ? "No matching logs found" : "No broadcast logs yet"}
            description={
              searchTerm 
                ? "No logs match your search criteria. Try adjusting your filters or search terms." 
                : "Start engaging with your members and trainers by sending your first broadcast message. All delivery statuses and logs will appear here."
            }
            buttonText={searchTerm ? "Clear Filters" : "Send First Broadcast"}
            onButtonClick={
              searchTerm 
                ? () => {
                    setSearchTerm('');
                    setFilters({});
                  }
                : () => navigate('/admin/notifications/send')
            }
          />
          
          {!searchTerm && (
            <div className="px-6 pb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Get Started</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Broadcast notifications are a powerful way to keep your community informed about:
                </p>
                <ul className="text-sm text-blue-700 space-y-1 ml-4">
                  <li>• 🎉 Special offers and promotions</li>
                  <li>• 📅 Schedule changes and announcements</li>
                  <li>• 🏆 Member achievements and events</li>
                  <li>• 💡 Health and fitness tips</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}