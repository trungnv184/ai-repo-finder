/**
 * Error codes for API responses
 */
export type ErrorCode = 'RATE_LIMITED' | 'API_ERROR' | 'INVALID_REQUEST' | 'NOT_FOUND';

/**
 * Detailed error information for failed API requests
 */
export interface ApiError {
  code: ErrorCode;
  message: string;
  retryAfter?: number;  // seconds until retry for rate limiting
}

/**
 * Metadata about the API response
 */
export interface ApiMeta {
  timestamp: string;
  fromCache: boolean;
  rateLimitRemaining?: number;
}

/**
 * Generic API response wrapper for all API endpoints
 * Provides consistent structure for success and error responses
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta: ApiMeta;
}
