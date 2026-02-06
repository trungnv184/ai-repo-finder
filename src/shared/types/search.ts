import type { Repository } from './repository';

/**
 * Sort field options for repository search
 */
export type SortField = 'stars' | 'forks' | 'updated' | 'name';

/**
 * Sort order options
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Options for searching and filtering repositories
 */
export interface SearchOptions {
  query?: string;              // Search keyword
  topics?: string[];           // AI-related topics to filter
  sortField: SortField;
  sortOrder: SortOrder;
  page: number;
  perPage: number;             // Max 50
}

/**
 * Result of a repository search operation
 */
export interface SearchResult {
  repositories: Repository[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  lastFetched: string;         // ISO timestamp
  fromCache: boolean;
}
