import request from 'supertest';
import type { SearchResult } from '../../../src/shared/types';

// Use fake timers to prevent setInterval in rateLimit middleware from keeping Jest open
jest.useFakeTimers();

// Mock the GitHubService before importing the app
const mockSearchRepositories = jest.fn();
const mockGetRateLimitRemaining = jest.fn();

jest.mock('../../../src/server/services/GitHubService', () => ({
  GitHubService: jest.fn().mockImplementation(() => ({
    searchRepositories: mockSearchRepositories,
    getRateLimitRemaining: mockGetRateLimitRemaining,
  })),
}));

// Mock the githubClient to avoid needing GITHUB_TOKEN
jest.mock('../../../src/server/services/githubClient', () => ({
  octokit: {
    rest: {
      search: { repos: jest.fn() },
    },
  },
}));

import { app } from '../../../src/server/index';

function createMockSearchResult(overrides: Partial<SearchResult> = {}): SearchResult {
  return {
    repositories: [
      {
        id: 1,
        name: 'test-repo',
        fullName: 'owner/test-repo',
        owner: {
          login: 'owner',
          avatarUrl: 'https://example.com/avatar',
        },
        description: 'A test repository',
        url: 'https://github.com/owner/test-repo',
        stars: 100,
        forks: 25,
        openIssues: 5,
        language: 'Python',
        topics: ['machine-learning'],
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
    ...overrides,
  };
}

describe('GET /api/repos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRateLimitRemaining.mockReturnValue(30);
  });

  it('should return repository list with 200 status', async () => {
    const mockResult = createMockSearchResult();
    mockSearchRepositories.mockResolvedValueOnce(mockResult);

    const response = await request(app).get('/api/repos');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.repositories).toHaveLength(1);
    expect(response.body.data.repositories[0].name).toBe('test-repo');
    expect(response.body.meta).toBeDefined();
    expect(response.body.meta.timestamp).toBeDefined();
  });

  it('should pass query parameter to search', async () => {
    const mockResult = createMockSearchResult();
    mockSearchRepositories.mockResolvedValueOnce(mockResult);

    await request(app).get('/api/repos?q=pytorch');

    expect(mockSearchRepositories).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'pytorch',
      })
    );
  });

  it('should pass sort parameter', async () => {
    const mockResult = createMockSearchResult();
    mockSearchRepositories.mockResolvedValueOnce(mockResult);

    await request(app).get('/api/repos?sort=forks');

    expect(mockSearchRepositories).toHaveBeenCalledWith(
      expect.objectContaining({
        sortField: 'forks',
      })
    );
  });

  it('should pass order parameter', async () => {
    const mockResult = createMockSearchResult();
    mockSearchRepositories.mockResolvedValueOnce(mockResult);

    await request(app).get('/api/repos?order=asc');

    expect(mockSearchRepositories).toHaveBeenCalledWith(
      expect.objectContaining({
        sortOrder: 'asc',
      })
    );
  });

  it('should pass page parameter', async () => {
    const mockResult = createMockSearchResult();
    mockSearchRepositories.mockResolvedValueOnce(mockResult);

    await request(app).get('/api/repos?page=3');

    expect(mockSearchRepositories).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 3,
      })
    );
  });

  it('should pass per_page parameter', async () => {
    const mockResult = createMockSearchResult();
    mockSearchRepositories.mockResolvedValueOnce(mockResult);

    await request(app).get('/api/repos?per_page=30');

    expect(mockSearchRepositories).toHaveBeenCalledWith(
      expect.objectContaining({
        perPage: 30,
      })
    );
  });

  it('should pass multiple query parameters together', async () => {
    const mockResult = createMockSearchResult();
    mockSearchRepositories.mockResolvedValueOnce(mockResult);

    await request(app).get('/api/repos?q=test&sort=stars&order=desc&page=2&per_page=10');

    expect(mockSearchRepositories).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'test',
        sortField: 'stars',
        sortOrder: 'desc',
        page: 2,
        perPage: 10,
      })
    );
  });

  it('should use default values when parameters are not provided', async () => {
    const mockResult = createMockSearchResult();
    mockSearchRepositories.mockResolvedValueOnce(mockResult);

    await request(app).get('/api/repos');

    expect(mockSearchRepositories).toHaveBeenCalledWith(
      expect.objectContaining({
        query: '',
        sortField: 'stars',
        sortOrder: 'desc',
        page: 1,
        perPage: 20,
        location: '',
      })
    );
  });

  it('should include fromCache in meta', async () => {
    const mockResult = createMockSearchResult({ fromCache: true });
    mockSearchRepositories.mockResolvedValueOnce(mockResult);

    const response = await request(app).get('/api/repos');

    expect(response.body.meta.fromCache).toBe(true);
  });

  it('should include rateLimitRemaining in meta', async () => {
    const mockResult = createMockSearchResult();
    mockSearchRepositories.mockResolvedValueOnce(mockResult);
    mockGetRateLimitRemaining.mockReturnValueOnce(25);

    const response = await request(app).get('/api/repos');

    expect(response.body.meta.rateLimitRemaining).toBe(25);
  });
});

describe('GET /api/repos - validation errors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 for invalid sort field', async () => {
    const response = await request(app).get('/api/repos?sort=invalid');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_REQUEST');
    expect(response.body.error.message).toContain('Invalid sort field');
  });

  it('should return 400 for invalid sort order', async () => {
    const response = await request(app).get('/api/repos?order=invalid');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_REQUEST');
    expect(response.body.error.message).toContain('Invalid sort order');
  });

  it('should return 400 for invalid page (non-integer)', async () => {
    const response = await request(app).get('/api/repos?page=abc');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_REQUEST');
  });

  it('should return 400 for page less than 1', async () => {
    const response = await request(app).get('/api/repos?page=0');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_REQUEST');
  });

  it('should return 400 for negative page', async () => {
    const response = await request(app).get('/api/repos?page=-1');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should return 400 for per_page greater than 50', async () => {
    const response = await request(app).get('/api/repos?per_page=51');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_REQUEST');
  });

  it('should return 400 for per_page less than 1', async () => {
    const response = await request(app).get('/api/repos?per_page=0');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should return 400 for non-integer per_page', async () => {
    const response = await request(app).get('/api/repos?per_page=abc');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

describe('GET /api/repos - error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRateLimitRemaining.mockReturnValue(null);
  });

  it('should return 500 when GitHubService throws a generic error', async () => {
    mockSearchRepositories.mockRejectedValueOnce(new Error('Network failure'));

    const response = await request(app).get('/api/repos');

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('API_ERROR');
    expect(response.body.error.message).toContain('Network failure');
  });

  it('should return 429 when GitHubService throws a rate limit error', async () => {
    mockSearchRepositories.mockRejectedValueOnce(
      new Error('GitHub API rate limit exceeded. Retry after 60 seconds.')
    );

    const response = await request(app).get('/api/repos');

    expect(response.status).toBe(429);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('RATE_LIMITED');
    expect(response.body.error.retryAfter).toBeDefined();
  });
});

describe('GET /api/health', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });
});

describe('404 handler', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/nonexistent');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
