// Fetch notification stats (all records, not paginated)
export async function fetchNotificationStats(filters: NotificationHistoryFilter = {}): Promise<{
  total: number;
  sent: number;
  failed: number;
  pending: number;
  partial: number;
  recentActivity: number;
}> {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.targetType) queryParams.append('targetType', filters.targetType);
  const res = await fetch(`${API_BASE_NOTIFICATION}/api/promotional-notifications/stats?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch notification stats');
  }
  return await res.json();
}
import { API_BASE_NOTIFICATION } from "../utils/config";
import type { NotificationRequest, PromotionalNotificationRequest, NotificationResult } from "../types/Notification"; // Updated import
import { TargetType } from "../types/TargetType"; // Correct import for TargetType

// Align with backend's NotificationLogResponse DTO
export interface NotificationLogResponse {
  id: number;
  targetType: TargetType;
  targetIdentifiers?: string[];
  messageContent: string;
  imageUrl?: string;
  status: string; // Backend returns String, could be 'SENT', 'FAILED', etc.
  timestamp: string; // ISO date string from LocalDateTime
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page number (0-indexed)
  first: boolean;
  last: boolean;
}

export interface NotificationHistoryFilter {
  status?: string; // Should align with backend status values
  targetType?: TargetType;
  searchTerm?: string; // e.g., for message content or recipient ID
}

export interface NotificationHistorySort {
  sortBy: 'timestamp' | 'status' | 'targetType'; // Changed 'sentAt' to 'timestamp' to match backend
  sortOrder: 'asc' | 'desc';
}

export async function sendTransactionalNotification(data: NotificationRequest): Promise<NotificationResult> {
  const res = await fetch(`${API_BASE_NOTIFICATION}/api/notifications/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  // Backend now returns success/failure string, not JSON with result object directly
  const textResponse = await res.text(); // Read as text

  if (res.ok) {
    // Attempt to extract message ID from success string if available
    const match = textResponse.match(/Message ID: (\S+)/);
    const externalMessageId = match ? match[1] : undefined;
    return { success: true, message: textResponse, externalMessageId };
  } else {
    // Treat any !res.ok as a failure
    return { success: false, message: textResponse || "Failed to send transactional notification." };
  }
}

export async function sendPromotionalNotification(data: PromotionalNotificationRequest) {
  const res = await fetch(`${API_BASE_NOTIFICATION}/api/promotional-notifications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  // Backend now returns success/failure string for promotional
  const textResponse = await res.text();

  if (res.ok || res.status === 207) { // 207 Multi-Status for partial success/failure
    return { success: true, message: textResponse }; // Success or partial success message
  } else {
    return { success: false, message: textResponse || "Failed to send promotional notification." };
  }
}

export async function getPromotionalNotificationHistory(
  page: number = 0,
  size: number = 10,
  filters: NotificationHistoryFilter = {},
  sort: NotificationHistorySort = { sortBy: 'timestamp', sortOrder: 'desc' } // Changed 'sentAt' to 'timestamp'
): Promise<PaginatedResponse<NotificationLogResponse>> { // Changed to NotificationLogResponse
  const queryParams = new URLSearchParams();

  queryParams.append('page', page.toString());
  queryParams.append('size', size.toString());

  if (filters.status) queryParams.append('status', filters.status);
  if (filters.targetType) queryParams.append('targetType', filters.targetType);
  if (filters.searchTerm) queryParams.append('searchTerm', filters.searchTerm);

  queryParams.append('sortBy', sort.sortBy);
  queryParams.append('sortOrder', sort.sortOrder);

  const res = await fetch(
    `${API_BASE_NOTIFICATION}/api/promotional-notifications/logs?${queryParams.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const errorBody = await res.json();
    throw new Error(errorBody.message || "Failed to fetch promotional notification logs.");
  }

  return (await res.json()) as PaginatedResponse<NotificationLogResponse>; // Changed to NotificationLogResponse
}