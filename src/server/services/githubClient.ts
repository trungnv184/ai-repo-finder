import { Octokit } from '@octokit/rest';

/**
 * GitHub API rate limit information
 * Tracks the current state of rate limiting for API requests
 */
export interface RateLimitInfo {
  /** Maximum number of requests allowed per hour */
  limit: number;
  /** Number of requests remaining in the current rate limit window */
  remaining: number;
  /** Timestamp when the rate limit will reset (Unix epoch time in seconds) */
  reset: number;
  /** Number of requests used in the current rate limit window */
  used: number;
}

let _octokit: Octokit | null = null;

/**
 * Configured Octokit instance for GitHub API access (lazy-initialized)
 * Use this instance for all GitHub API operations
 *
 * @throws {Error} If GITHUB_TOKEN environment variable is not set
 */
export const getOctokit = (): Octokit => {
  if (!_octokit) {
    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      throw new Error(
        'GITHUB_TOKEN environment variable is required for GitHub API access'
      );
    }

    _octokit = new Octokit({
      auth: githubToken,
      userAgent: 'github-ai-repo-finder/1.0.0',
      request: {
        timeout: 10000, // 10 seconds
      },
    });
  }
  return _octokit;
};

/**
 * Backward-compatible export - lazily creates octokit on first property access
 */
export const octokit = new Proxy({} as Octokit, {
  get(_target, prop) {
    return (getOctokit() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

/**
 * Retrieves current rate limit information from GitHub API
 *
 * @returns Promise resolving to rate limit information
 * @throws {Error} If the API request fails
 */
export async function getRateLimitInfo(): Promise<RateLimitInfo> {
  const client = getOctokit();
  const { data } = await client.rest.rateLimit.get();
  const { limit, remaining, reset, used } = data.rate;

  return {
    limit,
    remaining,
    reset,
    used,
  };
}
