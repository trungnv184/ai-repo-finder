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

/**
 * Configured Octokit instance for GitHub API access
 * Initialized with authentication token from environment variable
 *
 * @throws {Error} If GITHUB_TOKEN environment variable is not set
 */
const createOctokitInstance = (): Octokit => {
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    throw new Error(
      'GITHUB_TOKEN environment variable is required for GitHub API access'
    );
  }

  return new Octokit({
    auth: githubToken,
    userAgent: 'github-ai-repo-finder/1.0.0',
    // Optional: Add request timeout and retry configuration
    request: {
      timeout: 10000, // 10 seconds
    },
  });
};

/**
 * Configured GitHub API client instance
 * Use this instance for all GitHub API operations
 */
export const octokit = createOctokitInstance();

/**
 * Retrieves current rate limit information from GitHub API
 *
 * @returns Promise resolving to rate limit information
 * @throws {Error} If the API request fails
 */
export async function getRateLimitInfo(): Promise<RateLimitInfo> {
  const { data } = await octokit.rest.rateLimit.get();
  const { limit, remaining, reset, used } = data.rate;

  return {
    limit,
    remaining,
    reset,
    used,
  };
}
