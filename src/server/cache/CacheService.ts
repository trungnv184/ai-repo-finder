/**
 * Cache entry structure with value and expiration timestamp
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Interface for cache service operations
 */
export interface ICacheService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttlMs?: number): void;
  invalidate(key: string): void;
  clear(): void;
}

/**
 * In-memory cache service with TTL support
 * Provides a caching layer to reduce GitHub API calls
 */
export class CacheService implements ICacheService {
  private cache: Map<string, CacheEntry<any>>;
  private readonly DEFAULT_TTL_MS = 3600000; // 1 hour in milliseconds

  constructor() {
    this.cache = new Map();
  }

  /**
   * Retrieves a value from the cache if it exists and hasn't expired
   * @param key - The cache key
   * @returns The cached value or null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if the entry has expired
    if (Date.now() > entry.expiresAt) {
      // Remove expired entry
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Stores a value in the cache with an optional TTL
   * @param key - The cache key
   * @param value - The value to cache
   * @param ttlMs - Time to live in milliseconds (default: 1 hour)
   */
  set<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.DEFAULT_TTL_MS;
    const expiresAt = Date.now() + ttl;

    this.cache.set(key, {
      value,
      expiresAt,
    });
  }

  /**
   * Removes a specific entry from the cache
   * @param key - The cache key to invalidate
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clears all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }
}
