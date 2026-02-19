import { useState, useEffect, useCallback } from 'react';
import type { Repository, SortField, SortOrder } from '../../shared/types';
import { fetchRepos } from '../services/apiClient';

interface UseReposOptions {
  query?: string;
  sortField?: SortField;
  sortOrder?: SortOrder;
  page?: number;
  perPage?: number;
  location?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

interface UseReposResult {
  repos: Repository[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  lastFetched: string | null;
  fromCache: boolean;
  refetch: () => void;
}

export function useRepos(options: UseReposOptions = {}): UseReposResult {
  const { query, sortField = 'stars', sortOrder = 'desc', page = 1, perPage = 20, location } = options;

  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [fetchCount, setFetchCount] = useState(0);

  const refetch = useCallback(() => {
    setFetchCount((c) => c + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchRepos({ query, sortField, sortOrder, page, perPage, location })
      .then((response) => {
        if (cancelled) return;
        if (response.success && response.data) {
          setRepos(response.data.repositories);
          setPagination({
            currentPage: response.data.currentPage,
            totalPages: response.data.totalPages,
            totalCount: response.data.totalCount,
          });
          setLastFetched(response.data.lastFetched);
          setFromCache(response.data.fromCache);
        } else {
          setError(response.error?.message ?? 'Failed to fetch repositories');
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, sortField, sortOrder, page, perPage, location, fetchCount]);

  return { repos, loading, error, pagination, lastFetched, fromCache, refetch };
}
