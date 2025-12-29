// ============================================================================
// Common API Models
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  errorMessage?: string;
  developerMessage?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  generalStock?: {
    newStock: number;
    usedStock: number;
    totalStock: number;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
}
