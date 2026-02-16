import type { ApiResponse, SearchResult } from '../../shared/types';

interface FetchReposParams {
  query?: string;
  sortField?: string;
  sortOrder?: string;
  page?: number;
  perPage?: number;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export async function fetchRepos(params: FetchReposParams): Promise<ApiResponse<SearchResult>> {
  const searchParams = new URLSearchParams();

  if (params.query) searchParams.set('query', params.query);
  if (params.sortField) searchParams.set('sortField', params.sortField);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.perPage) searchParams.set('perPage', params.perPage.toString());

  const url = `${API_BASE_URL}/api/repos?${searchParams.toString()}`;
  const response = await fetch(url);
  const data: ApiResponse<SearchResult> = await response.json();
  return data;
}
