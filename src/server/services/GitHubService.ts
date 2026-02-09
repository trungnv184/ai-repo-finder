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

/**
 * Service for fetching AI repositories from GitHub
 * Provides business logic for GitHub data fetching with caching support
 */
export class GitHubService {
  private cacheService: CacheService;

  /**
   * Creates a new GitHubService instance
   * @param cacheService - Cache service for storing API responses
   */
  constructor(cacheService: CacheService) {
    this.cacheService = cacheService;
  }

  /**
   * Searches for AI-related repositories on GitHub
   * Builds a search query with AI topics and transforms the response
   *
   * @param options - Search options including query, topics, sorting, and pagination
   * @returns Promise resolving to search results with repositories and metadata
   * @throws {Error} If the GitHub API request fails
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

    try {
      // Call GitHub Search API
      const response = await octokit.rest.search.repos({
        q: searchQuery,
        sort: sortParam,
        order: options.sortOrder,
        per_page: options.perPage,
        page: options.page,
      });

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
    } catch (error) {
      // Re-throw with more context
      throw new Error(
        `Failed to search repositories: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Builds a GitHub search query string from search options
   * Combines user query with AI-related topics
   *
   * @param options - Search options
   * @returns GitHub search query string
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

    // Add topics to query (OR condition between topics)
    if (topics.length > 0) {
      const topicQuery = topics.map(topic => `topic:${topic}`).join(' OR ');
      queryParts.push(`(${topicQuery})`);
    }

    // Join all parts with AND condition
    return queryParts.join(' ');
  }

  /**
   * Transforms GitHub API repository items to our Repository format
   *
   * @param items - Raw repository items from GitHub API
   * @returns Transformed repository array
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
   *
   * @param sortField - Our sort field
   * @returns GitHub API sort parameter
   */
  private mapSortField(sortField: string): 'stars' | 'forks' | 'updated' | undefined {
    // GitHub API uses undefined for relevance sorting
    if (sortField === 'name') {
      return undefined; // GitHub doesn't support name sorting, use relevance instead
    }
    return sortField as 'stars' | 'forks' | 'updated';
  }

  /**
   * Generates a cache key from search options
   *
   * @param options - Search options
   * @returns Cache key string
   */
  private generateCacheKey(options: SearchOptions): string {
    const topicsKey = (options.topics || DEFAULT_AI_TOPICS).sort().join(',');
    return `search:${options.query || ''}:${topicsKey}:${options.sortField}:${options.sortOrder}:${options.page}:${options.perPage}`;
  }
}
