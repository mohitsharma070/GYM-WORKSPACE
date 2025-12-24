export type SortDirection = "asc" | "desc";

export type UserSortBy = "id" | "name" | "email" | "role" | "createdAt";

export interface PageRequest {
  page?: number;
  size?: number;
  sortBy?: UserSortBy;
  sortDir?: SortDirection;
  search?: string;
}

export interface PageResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sort?: unknown;
  first?: boolean;
  last?: boolean;
}
