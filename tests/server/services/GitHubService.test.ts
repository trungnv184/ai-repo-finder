import { GitHubService } from '../../../src/server/services/GitHubService';
import { CacheService } from '../../../src/server/cache/CacheService';
import type { SearchOptions, SearchResult } from '../../../src/shared/types';

// Mock the octokit module
jest.mock('../../../src/server/services/githubClient', () => ({
  octokit: {
    rest: {
      search: {
        repos: jest.fn(),
      },
      users: {
        getByUsername: jest.fn(),
      },
    },
  },
}));

// Import after mocking
import { octokit } from '../../../src/server/services/githubClient';

const mockRepos = octokit.rest.search.repos as jest.MockedFunction<typeof octokit.rest.search.repos>;
const mockGetByUsername = (octokit.rest.users as any).getByUsername as jest.MockedFunction<any>;

/**
 * Creates a mock GitHub API response item
 */
function createMockGitHubItem(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    name: 'test-repo',
    full_name: 'owner/test-repo',
    owner: {
      login: 'owner',
      avatar_url: 'https://avatars.example.com/owner',
    },
    description: 'A test repository',
    html_url: 'https://github.com/owner/test-repo',
    stargazers_count: 100,
    forks_count: 25,
    open_issues_count: 5,
    language: 'Python',
    topics: ['machine-learning', 'deep-learning'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
    pushed_at: '2024-06-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Creates a successful mock API response
 */
function createMockResponse(items: any[] = [], totalCount?: number) {
  return {
    data: {
      total_count: totalCount ?? items.length,
      incomplete_results: false,
      items,
    },
    status: 200,
    headers: {},
    url: '',
  } as any;
}

/**
 * Creates default search options
 */
function createDefaultOptions(overrides: Partial<SearchOptions> = {}): SearchOptions {
  return {
    query: 'test',
    sortField: 'stars',
    sortOrder: 'desc',
    page: 1,
    perPage: 10,
    ...overrides,
  };
}

/**
 * Creates an error with a status code (mimicking Octokit errors)
 */
function createOctokitError(status: number, message: string, headers: Record<string, string> = {}) {
  const error = new Error(message) as Error & { status: number; response: { headers: Record<string, string> } };
  error.status = status;
  error.response = { headers };
  return error;
}

describe('GitHubService', () => {
  let service: GitHubService;
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
    service = new GitHubService(cacheService);
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Default mock for user profile enrichment
    mockGetByUsername.mockResolvedValue({ data: { location: null } });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('searchRepositories', () => {
    it('should fetch repositories and transform data correctly', async () => {
      const mockItem = createMockGitHubItem();
      mockRepos.mockResolvedValueOnce(createMockResponse([mockItem], 1));

      const options = createDefaultOptions();
      const result = await service.searchRepositories(options);

      expect(result.repositories).toHaveLength(1);
      expect(result.repositories[0]).toEqual({
        id: 1,
        name: 'test-repo',
        fullName: 'owner/test-repo',
        owner: {
          login: 'owner',
          avatarUrl: 'https://avatars.example.com/owner',
          location: null,
        },
        description: 'A test repository',
        url: 'https://github.com/owner/test-repo',
        stars: 100,
        forks: 25,
        openIssues: 5,
        language: 'Python',
        topics: ['machine-learning', 'deep-learning'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-06-01T00:00:00Z',
        pushedAt: '2024-06-01T00:00:00Z',
      });
      expect(result.totalCount).toBe(1);
      expect(result.currentPage).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.fromCache).toBe(false);
      expect(result.lastFetched).toBeDefined();
    });

    it('should transform multiple repositories', async () => {
      const items = [
        createMockGitHubItem({ id: 1, name: 'repo-1' }),
        createMockGitHubItem({ id: 2, name: 'repo-2' }),
        createMockGitHubItem({ id: 3, name: 'repo-3' }),
      ];

      mockRepos.mockResolvedValueOnce(createMockResponse(items, 100));

      const options = createDefaultOptions({ perPage: 3 });
      const result = await service.searchRepositories(options);

      expect(result.repositories).toHaveLength(3);
      expect(result.repositories[0].name).toBe('repo-1');
      expect(result.repositories[1].name).toBe('repo-2');
      expect(result.repositories[2].name).toBe('repo-3');
      expect(result.totalCount).toBe(100);
      expect(result.totalPages).toBe(34); // ceil(100/3)
    });

    it('should handle empty search results', async () => {
      mockRepos.mockResolvedValueOnce(createMockResponse([], 0));

      const options = createDefaultOptions();
      const result = await service.searchRepositories(options);

      expect(result.repositories).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should handle repositories with null description and language', async () => {
      const mockItem = createMockGitHubItem({
        description: null,
        language: null,
        topics: [],
      });

      mockRepos.mockResolvedValueOnce(createMockResponse([mockItem], 1));

      const options = createDefaultOptions();
      const result = await service.searchRepositories(options);

      expect(result.repositories[0].description).toBeNull();
      expect(result.repositories[0].language).toBeNull();
      expect(result.repositories[0].topics).toEqual([]);
    });

    it('should calculate totalPages correctly', async () => {
      mockRepos.mockResolvedValueOnce(
        createMockResponse(Array(10).fill(createMockGitHubItem()), 55)
      );

      const options = createDefaultOptions({ perPage: 10, page: 1 });
      const result = await service.searchRepositories(options);

      expect(result.totalPages).toBe(6); // ceil(55/10)
      expect(result.currentPage).toBe(1);
    });

    it('should pass correct parameters to GitHub API', async () => {
      mockRepos.mockResolvedValueOnce(createMockResponse([]));

      const options = createDefaultOptions({
        query: 'pytorch transformer',
        sortField: 'forks',
        sortOrder: 'asc',
        page: 3,
        perPage: 20,
      });

      await service.searchRepositories(options);

      expect(mockRepos).toHaveBeenCalledWith({
        q: expect.stringContaining('pytorch transformer'),
        sort: 'forks',
        order: 'asc',
        per_page: 20,
        page: 3,
      });
    });

    it('should include AI topics in query when no custom topics provided', async () => {
      mockRepos.mockResolvedValueOnce(createMockResponse([]));

      const options = createDefaultOptions({ query: 'neural' });
      await service.searchRepositories(options);

      const calledQuery = (mockRepos.mock.calls[0]![0] as any).q as string;
      expect(calledQuery).toContain('neural');
      expect(calledQuery).toContain('topic:ai');
    });

    it('should use custom topics when provided', async () => {
      mockRepos.mockResolvedValueOnce(createMockResponse([]));

      const options = createDefaultOptions({
        topics: ['custom-topic-1', 'custom-topic-2'],
      });

      await service.searchRepositories(options);

      const calledQuery = (mockRepos.mock.calls[0]![0] as any).q as string;
      expect(calledQuery).toContain('topic:custom-topic-1');
      expect(calledQuery).not.toContain('topic:artificial-intelligence');
    });

    it('should map sort field "name" to undefined (relevance)', async () => {
      mockRepos.mockResolvedValueOnce(createMockResponse([]));

      const options = createDefaultOptions({ sortField: 'name' });
      await service.searchRepositories(options);

      expect(mockRepos).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: undefined,
        })
      );
    });

    it('should handle missing topics on repository items', async () => {
      const mockItem = createMockGitHubItem({ topics: undefined });

      mockRepos.mockResolvedValueOnce(createMockResponse([mockItem], 1));

      const options = createDefaultOptions();
      const result = await service.searchRepositories(options);

      expect(result.repositories[0].topics).toEqual([]);
    });
  });

  describe('caching behavior', () => {
    it('should return cached result on cache hit', async () => {
      const cachedResult: SearchResult = {
        repositories: [
          {
            id: 1,
            name: 'cached-repo',
            fullName: 'owner/cached-repo',
            owner: { login: 'owner', avatarUrl: 'https://example.com/avatar' },
            description: 'Cached',
            url: 'https://github.com/owner/cached-repo',
            stars: 50,
            forks: 10,
            openIssues: 2,
            language: 'TypeScript',
            topics: ['ai'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-06-01T00:00:00Z',
            pushedAt: '2024-06-01T00:00:00Z',
          },
        ],
        totalCount: 1,
        currentPage: 1,
        totalPages: 1,
        lastFetched: '2024-06-01T00:00:00Z',
        fromCache: false,
      };

      jest.spyOn(cacheService, 'get').mockReturnValueOnce(cachedResult);

      const options = createDefaultOptions();
      const result = await service.searchRepositories(options);

      expect(result.fromCache).toBe(true);
      expect(result.repositories[0].name).toBe('cached-repo');
      expect(mockRepos).not.toHaveBeenCalled();
    });

    it('should fetch from API on cache miss', async () => {
      mockRepos.mockResolvedValueOnce(createMockResponse([createMockGitHubItem()], 1));

      jest.spyOn(cacheService, 'get').mockReturnValueOnce(null);
      const setSpy = jest.spyOn(cacheService, 'set');

      const options = createDefaultOptions();
      const result = await service.searchRepositories(options);

      expect(result.fromCache).toBe(false);
      expect(mockRepos).toHaveBeenCalledTimes(1);
      // set is called for: user profile cache + search result cache
      expect(setSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^search:/),
        expect.objectContaining({ repositories: expect.any(Array) })
      );
    });

    it('should cache API results after successful fetch', async () => {
      mockRepos.mockResolvedValueOnce(createMockResponse([createMockGitHubItem()], 1));

      const setSpy = jest.spyOn(cacheService, 'set');

      const options = createDefaultOptions();
      await service.searchRepositories(options);

      expect(setSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          repositories: expect.any(Array),
          totalCount: 1,
          fromCache: false,
        })
      );
    });

    it('should generate different cache keys for different queries', async () => {
      mockRepos.mockResolvedValue(createMockResponse([]));

      const setSpy = jest.spyOn(cacheService, 'set');

      await service.searchRepositories(createDefaultOptions({ query: 'pytorch' }));
      await service.searchRepositories(createDefaultOptions({ query: 'tensorflow' }));

      expect(setSpy).toHaveBeenCalledTimes(2);
      const key1 = setSpy.mock.calls[0]![0];
      const key2 = setSpy.mock.calls[1]![0];
      expect(key1).not.toBe(key2);
    });

    it('should generate different cache keys for different pages', async () => {
      mockRepos.mockResolvedValue(createMockResponse([]));

      const setSpy = jest.spyOn(cacheService, 'set');

      await service.searchRepositories(createDefaultOptions({ page: 1 }));
      await service.searchRepositories(createDefaultOptions({ page: 2 }));

      const key1 = setSpy.mock.calls[0]![0];
      const key2 = setSpy.mock.calls[1]![0];
      expect(key1).not.toBe(key2);
    });
  });

  describe('error handling', () => {
    it('should throw after all retries exhausted for server errors', async () => {
      const serverError = createOctokitError(500, 'Internal Server Error');
      mockRepos.mockRejectedValue(serverError);

      const options = createDefaultOptions();

      // Start the search and collect both the result and timer advancement
      const resultPromise = service.searchRepositories(options);
      // Catch to prevent unhandled rejection while timers advance
      resultPromise.catch(() => {});

      // Advance through all retry delays
      await jest.advanceTimersByTimeAsync(10000);

      await expect(resultPromise).rejects.toThrow(
        /Failed to search repositories after 3 attempts/
      );
      expect(mockRepos).toHaveBeenCalledTimes(3);
    });

    it('should throw immediately for client errors (4xx, non-rate-limit)', async () => {
      const clientError = createOctokitError(422, 'Validation Failed');
      mockRepos.mockRejectedValueOnce(clientError);

      const options = createDefaultOptions();

      await expect(service.searchRepositories(options)).rejects.toThrow(
        'GitHub API request failed: Validation Failed'
      );
      expect(mockRepos).toHaveBeenCalledTimes(1);
    });

    it('should throw rate limit error for 429 status', async () => {
      const rateLimitError = createOctokitError(429, 'rate limit exceeded', {
        'retry-after': '30',
      });
      mockRepos.mockRejectedValueOnce(rateLimitError);

      const options = createDefaultOptions();

      await expect(service.searchRepositories(options)).rejects.toThrow(
        /rate limit exceeded/
      );
    });

    it('should throw rate limit error for 403 with rate limit message', async () => {
      const rateLimitError = createOctokitError(
        403,
        'API rate limit exceeded for user'
      );
      mockRepos.mockRejectedValueOnce(rateLimitError);

      const options = createDefaultOptions();

      await expect(service.searchRepositories(options)).rejects.toThrow(
        /rate limit exceeded/i
      );
    });

    it('should not cache results when API call fails', async () => {
      const clientError = createOctokitError(422, 'Validation Failed');
      mockRepos.mockRejectedValueOnce(clientError);
      const setSpy = jest.spyOn(cacheService, 'set');

      const options = createDefaultOptions();

      await expect(service.searchRepositories(options)).rejects.toThrow();
      expect(setSpy).not.toHaveBeenCalled();
    });

    it('should check cache before API call', async () => {
      const getSpy = jest.spyOn(cacheService, 'get').mockReturnValueOnce(null);
      const clientError = createOctokitError(422, 'error');
      mockRepos.mockRejectedValueOnce(clientError);

      const options = createDefaultOptions();

      await expect(service.searchRepositories(options)).rejects.toThrow();
      expect(getSpy).toHaveBeenCalled();
    });
  });

  describe('retry logic', () => {
    it('should retry on server errors with exponential backoff', async () => {
      const serverError = createOctokitError(500, 'Internal Server Error');
      mockRepos
        .mockRejectedValueOnce(serverError)
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce(createMockResponse([createMockGitHubItem()], 1));

      const options = createDefaultOptions();
      const promise = service.searchRepositories(options);

      // First retry after 1s
      await jest.advanceTimersByTimeAsync(1000);
      // Second retry after 2s
      await jest.advanceTimersByTimeAsync(2000);

      const result = await promise;

      expect(mockRepos).toHaveBeenCalledTimes(3);
      expect(result.repositories).toHaveLength(1);
      expect(result.fromCache).toBe(false);
    });

    it('should succeed on first attempt without retrying', async () => {
      mockRepos.mockResolvedValueOnce(createMockResponse([createMockGitHubItem()], 1));

      const options = createDefaultOptions();
      const result = await service.searchRepositories(options);

      expect(mockRepos).toHaveBeenCalledTimes(1);
      expect(result.repositories).toHaveLength(1);
    });

    it('should not retry on client errors', async () => {
      const clientError = createOctokitError(400, 'Bad Request');
      mockRepos.mockRejectedValueOnce(clientError);

      const options = createDefaultOptions();

      await expect(service.searchRepositories(options)).rejects.toThrow();
      expect(mockRepos).toHaveBeenCalledTimes(1);
    });

    it('should return fallback cached data when all retries exhausted', async () => {
      const serverError = createOctokitError(500, 'Server Error');
      mockRepos.mockRejectedValue(serverError);

      // Set up stale cache that will be found on fallback
      const cachedResult: SearchResult = {
        repositories: [
          {
            id: 1,
            name: 'fallback-repo',
            fullName: 'owner/fallback-repo',
            owner: { login: 'owner', avatarUrl: 'https://example.com/avatar' },
            description: 'Fallback',
            url: 'https://github.com/owner/fallback-repo',
            stars: 10,
            forks: 2,
            openIssues: 0,
            language: 'JavaScript',
            topics: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-06-01T00:00:00Z',
            pushedAt: '2024-06-01T00:00:00Z',
          },
        ],
        totalCount: 1,
        currentPage: 1,
        totalPages: 1,
        lastFetched: '2024-01-01T00:00:00Z',
        fromCache: false,
      };

      // First call returns null (initial cache check), subsequent calls return cached data (fallback)
      jest.spyOn(cacheService, 'get')
        .mockReturnValueOnce(null)
        .mockReturnValue(cachedResult);

      const options = createDefaultOptions();
      const promise = service.searchRepositories(options);

      // Advance through retry delays
      await jest.advanceTimersByTimeAsync(1000);
      await jest.advanceTimersByTimeAsync(2000);

      const result = await promise;

      expect(result.fromCache).toBe(true);
      expect(result.repositories[0].name).toBe('fallback-repo');
    });

    it('should return stale cache on rate limit error when cache available', async () => {
      const rateLimitError = createOctokitError(429, 'rate limit exceeded');
      mockRepos.mockRejectedValueOnce(rateLimitError);

      const cachedResult: SearchResult = {
        repositories: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
        lastFetched: '2024-01-01T00:00:00Z',
        fromCache: false,
      };

      // First get returns null (initial check), second returns stale cache (rate limit fallback)
      jest.spyOn(cacheService, 'get')
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(cachedResult);

      const options = createDefaultOptions();
      const result = await service.searchRepositories(options);

      expect(result.fromCache).toBe(true);
    });
  });

  describe('rate limit tracking', () => {
    it('should return null for rate limit when no API call has been made', () => {
      expect(service.getRateLimitRemaining()).toBeNull();
    });

    it('should extract rate limit from response headers', async () => {
      mockRepos.mockResolvedValueOnce({
        data: {
          total_count: 0,
          incomplete_results: false,
          items: [],
        },
        status: 200,
        headers: {
          'x-ratelimit-remaining': '28',
        },
        url: '',
      } as any);

      const options = createDefaultOptions();
      await service.searchRepositories(options);

      expect(service.getRateLimitRemaining()).toBe(28);
    });

    it('should set rate limit to 0 on rate limit error', async () => {
      const rateLimitError = createOctokitError(429, 'rate limit exceeded');
      mockRepos.mockRejectedValueOnce(rateLimitError);

      const options = createDefaultOptions();

      await expect(service.searchRepositories(options)).rejects.toThrow();

      expect(service.getRateLimitRemaining()).toBe(0);
    });
  });

  describe('query building', () => {
    it('should build query with only default topics when no query provided', async () => {
      mockRepos.mockResolvedValueOnce(createMockResponse([]));

      const options = createDefaultOptions({ query: undefined });
      await service.searchRepositories(options);

      const calledQuery = (mockRepos.mock.calls[0]![0] as any).q as string;
      expect(calledQuery).toContain('topic:');
      expect(calledQuery).not.toMatch(/^\s/);
    });

    it('should build query with empty string query', async () => {
      mockRepos.mockResolvedValueOnce(createMockResponse([]));

      const options = createDefaultOptions({ query: '' });
      await service.searchRepositories(options);

      const calledQuery = (mockRepos.mock.calls[0]![0] as any).q as string;
      expect(calledQuery).toContain('topic:');
    });

    it('should trim query whitespace', async () => {
      mockRepos.mockResolvedValueOnce(createMockResponse([]));

      const options = createDefaultOptions({ query: '  pytorch  ' });
      await service.searchRepositories(options);

      const calledQuery = (mockRepos.mock.calls[0]![0] as any).q as string;
      expect(calledQuery).toContain('pytorch');
      expect(calledQuery).not.toContain('  pytorch  ');
    });

    it('should use the first topic from the provided list', async () => {
      mockRepos.mockResolvedValueOnce(createMockResponse([]));

      const options = createDefaultOptions({
        topics: ['topic-a', 'topic-b'],
      });

      await service.searchRepositories(options);

      const calledQuery = (mockRepos.mock.calls[0]![0] as any).q as string;
      expect(calledQuery).toContain('topic:topic-a');
    });
  });

  describe('sort field mapping', () => {
    const sortTestCases: Array<{ sortField: SearchOptions['sortField']; expected: string | undefined }> = [
      { sortField: 'stars', expected: 'stars' },
      { sortField: 'forks', expected: 'forks' },
      { sortField: 'updated', expected: 'updated' },
      { sortField: 'name', expected: undefined },
    ];

    sortTestCases.forEach(({ sortField, expected }) => {
      it(`should map sort field "${sortField}" to "${expected}"`, async () => {
        mockRepos.mockResolvedValueOnce(createMockResponse([]));

        const options = createDefaultOptions({ sortField });
        await service.searchRepositories(options);

        expect(mockRepos).toHaveBeenCalledWith(
          expect.objectContaining({
            sort: expected,
          })
        );
      });
    });
  });
});
