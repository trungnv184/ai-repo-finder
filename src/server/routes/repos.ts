import { Router, Request, Response } from 'express';
import { GitHubService } from '../services/GitHubService';
import { CacheService } from '../cache/CacheService';
import { validateRepoQuery } from '../middleware/validateRepoQuery';
import type { SearchOptions, ApiResponse, SearchResult, SortField, SortOrder } from '../../shared/types';

const router = Router();

// Shared service instances
const cacheService = new CacheService();
const githubService = new GitHubService(cacheService);

/**
 * GET /
 * Search for AI-related repositories
 * Query params: q, sort, order, page, per_page
 */
router.get('/', validateRepoQuery, async (req: Request, res: Response) => {
  try {
    const options: SearchOptions = {
      query: (req.query.q as string) || '',
      sortField: (req.query.sort as SortField) || 'stars',
      sortOrder: (req.query.order as SortOrder) || 'desc',
      page: parseInt(req.query.page as string, 10) || 1,
      perPage: parseInt(req.query.per_page as string, 10) || 20,
    };

    const result = await githubService.searchRepositories(options);

    const response: ApiResponse<SearchResult> = {
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        fromCache: result.fromCache,
        rateLimitRemaining: githubService.getRateLimitRemaining() ?? undefined,
      },
    };

    res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const isRateLimit = message.toLowerCase().includes('rate limit');

    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: isRateLimit ? 'RATE_LIMITED' : 'API_ERROR',
        message,
        ...(isRateLimit ? { retryAfter: 60 } : {}),
      },
      meta: {
        timestamp: new Date().toISOString(),
        fromCache: false,
        rateLimitRemaining: githubService.getRateLimitRemaining() ?? undefined,
      },
    };

    res.status(isRateLimit ? 429 : 500).json(response);
  }
});

export default router;
