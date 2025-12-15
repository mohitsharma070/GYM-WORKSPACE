import { API_BASE_NOTIFICATION } from "../utils/config";
import type { PromotionalNotificationRequest } from "../types/Notification";
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

export async function sendPromotionalNotification(data: PromotionalNotificationRequest) {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE_NOTIFICATION}/api/promotional-notifications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Basic ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorBody = await res.json();
    throw new Error(errorBody.message || "Failed to send promotional notification.");
  }

  return res.json();
}

export async function getPromotionalNotificationHistory(
  page: number = 0,
  size: number = 10,
  filters: NotificationHistoryFilter = {},
  sort: NotificationHistorySort = { sortBy: 'timestamp', sortOrder: 'desc' } // Changed 'sentAt' to 'timestamp'
): Promise<PaginatedResponse<NotificationLogResponse>> { // Changed to NotificationLogResponse
  const token = localStorage.getItem("authToken");
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
        ...(token ? { Authorization: `Basic ${token}` } : {}),
      },
    }
  );

  if (!res.ok) {
    const errorBody = await res.json();
    throw new Error(errorBody.message || "Failed to fetch promotional notification logs.");
  }

  return (await res.json()) as PaginatedResponse<NotificationLogResponse>; // Changed to NotificationLogResponse
}