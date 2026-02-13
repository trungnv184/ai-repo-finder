import { octokit } from './githubClient';
import { CacheService } from '../cache/CacheService';
import type { Repository, SearchOptions, SearchResult } from '../../shared/types';

/**
 * Default AI-related topics for repository search
 * These topics are used to filter repositories related to AI/ML
 */
const DEFAULT_AI_TOPICS = [
  'artificial-intelligence',
  'machine-learning',
  'deep-learning',
  'neural-network',
  'llm',
  'gpt',
  'transformers',
  'pytorch',
  'tensorflow',
];

/** Maximum number of retry attempts for failed requests */
const MAX_RETRIES = 3;

/** Base delay in milliseconds for exponential backoff (1s, 2s, 4s) */
const BASE_RETRY_DELAY_MS = 1000;

/**
 * Service for fetching AI repositories from GitHub
 * Provides business logic for GitHub data fetching with caching, retry, and error handling
 */
export class GitHubService {
  private cacheService: CacheService;
  private rateLimitRemaining: number | null = null;

  /**
   * Creates a new GitHubService instance
   * @param cacheService - Cache service for storing API responses
   */
  constructor(cacheService: CacheService) {
    this.cacheService = cacheService;
  }

  /**
   * Returns the number of GitHub API requests remaining in the current rate limit window.
   * Returns null if no API call has been made yet.
   */
  getRateLimitRemaining(): number | null {
    return this.rateLimitRemaining;
  }

  /**
   * Searches for AI-related repositories on GitHub
   * Includes retry logic with exponential backoff and rate limit handling
   *
   * @param options - Search options including query, topics, sorting, and pagination
   * @returns Promise resolving to search results with repositories and metadata
   * @throws {Error} If the GitHub API request fails after all retries
   */
  async searchRepositories(options: SearchOptions): Promise<SearchResult> {
    // Generate cache key based on search options
    const cacheKey = this.generateCacheKey(options);

    // Check if result is cached
    const cachedResult = this.cacheService.get<SearchResult>(cacheKey);
    if (cachedResult) {
      return {
        ...cachedResult,
        fromCache: true,
      };
    }

    // Build search query with AI topics
    const searchQuery = this.buildSearchQuery(options);

    // Map sort field to GitHub API format
    const sortParam = this.mapSortField(options.sortField);

    // Attempt the request with retries
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await octokit.rest.search.repos({
          q: searchQuery,
          sort: sortParam,
          order: options.sortOrder,
          per_page: options.perPage,
          page: options.page,
        });

        // Extract rate limit info from response headers
        const rateLimitHeader = response.headers['x-ratelimit-remaining'];
        if (rateLimitHeader !== undefined) {
          this.rateLimitRemaining = parseInt(String(rateLimitHeader), 10);
        }

        // Transform GitHub API response to our Repository format
        const repositories = this.transformRepositories(response.data.items);

        // Calculate pagination metadata
        const totalCount = response.data.total_count;
        const totalPages = Math.ceil(totalCount / options.perPage);

        // Build search result
        const searchResult: SearchResult = {
          repositories,
          totalCount,
          currentPage: options.page,
          totalPages,
          lastFetched: new Date().toISOString(),
          fromCache: false,
        };

        // Cache the result (1 hour TTL)
        this.cacheService.set(cacheKey, searchResult);

        return searchResult;
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if this is a rate limit error (HTTP 403 with rate limit message, or 429)
        if (this.isRateLimitError(error)) {
          this.rateLimitRemaining = 0;

          // If we have cached data, return it instead of failing
          const staleCache = this.cacheService.get<SearchResult>(cacheKey);
          if (staleCache) {
            return {
              ...staleCache,
              fromCache: true,
            };
          }

          // Extract retry-after from response if available
          const retryAfter = this.extractRetryAfter(error);
          throw new Error(
            `GitHub API rate limit exceeded. Retry after ${retryAfter} seconds.`
          );
        }

        // Don't retry on client errors (4xx) other than rate limiting
        if (this.isClientError(error) && !this.isRateLimitError(error)) {
          throw new Error(
            `GitHub API request failed: ${lastError.message}`
          );
        }

        // For server errors and network timeouts, retry with exponential backoff
        if (attempt < MAX_RETRIES) {
          const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    // All retries exhausted - try to return cached data as fallback
    const fallbackCache = this.cacheService.get<SearchResult>(cacheKey);
    if (fallbackCache) {
      return {
        ...fallbackCache,
        fromCache: true,
      };
    }

    throw new Error(
      `Failed to search repositories after ${MAX_RETRIES} attempts: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Builds a GitHub search query string from search options
   * Combines user query with AI-related topics
   */
  private buildSearchQuery(options: SearchOptions): string {
    const queryParts: string[] = [];

    // Add user-provided search query if present
    if (options.query && options.query.trim()) {
      queryParts.push(options.query.trim());
    }

    // Determine which topics to use (custom or default)
    const topics = options.topics && options.topics.length > 0
      ? options.topics
      : DEFAULT_AI_TOPICS;

    // GitHub Search API only supports a single topic: qualifier per query.
    // Use the first topic as the primary filter.
    if (topics.length > 0) {
      queryParts.push(`topic:${topics[0]}`);
    }

    // Add a minimum stars filter so the default page shows popular repos
    if (!options.query || !options.query.trim()) {
      queryParts.push('stars:>100');
    }

    return queryParts.join(' ');
  }

  /**
   * Transforms GitHub API repository items to our Repository format
   */
  private transformRepositories(items: any[]): Repository[] {
    return items.map(item => ({
      id: item.id,
      name: item.name,
      fullName: item.full_name,
      owner: {
        login: item.owner.login,
        avatarUrl: item.owner.avatar_url,
      },
      description: item.description,
      url: item.html_url,
      stars: item.stargazers_count,
      forks: item.forks_count,
      openIssues: item.open_issues_count,
      language: item.language,
      topics: item.topics || [],
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      pushedAt: item.pushed_at,
    }));
  }

  /**
   * Maps our sort field to GitHub API sort parameter
   */
  private mapSortField(sortField: string): 'stars' | 'forks' | 'updated' | undefined {
    if (sortField === 'name') {
      return undefined;
    }
    return sortField as 'stars' | 'forks' | 'updated';
  }

  /**
   * Generates a cache key from search options
   */
  private generateCacheKey(options: SearchOptions): string {
    const topicsKey = (options.topics || DEFAULT_AI_TOPICS).sort().join(',');
    return `search:${options.query || ''}:${topicsKey}:${options.sortField}:${options.sortOrder}:${options.page}:${options.perPage}`;
  }

  /**
   * Checks if an error is a GitHub rate limit error (403 rate limit or 429)
   */
  private isRateLimitError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status: number }).status;
      if (status === 429) return true;
      if (status === 403) {
        const message = 'message' in error ? String((error as { message: string }).message) : '';
        return message.toLowerCase().includes('rate limit');
      }
    }
    return false;
  }

  /**
   * Checks if an error is a client error (4xx status)
   */
  private isClientError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status: number }).status;
      return status >= 400 && status < 500;
    }
    return false;
  }

  /**
   * Extracts the retry-after value from a rate limit error response
   * Returns a default of 60 seconds if not found
   */
  private extractRetryAfter(error: unknown): number {
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response: { headers?: Record<string, string> } }).response;
      if (response?.headers) {
        const retryAfter = response.headers['retry-after'];
        if (retryAfter) {
          return parseInt(retryAfter, 10) || 60;
        }
      }
    }
    return 60;
  }

  /**
   * Sleeps for the specified number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
