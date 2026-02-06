import { CacheService } from '../../../src/server/cache/CacheService';

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('set and get operations', () => {
    it('should store and retrieve a value', () => {
      const key = 'test-key';
      const value = { data: 'test-data' };

      cacheService.set(key, value);
      const retrieved = cacheService.get(key);

      expect(retrieved).toEqual(value);
    });

    it('should store and retrieve string values', () => {
      const key = 'string-key';
      const value = 'test-string';

      cacheService.set(key, value);
      const retrieved = cacheService.get<string>(key);

      expect(retrieved).toBe(value);
    });

    it('should store and retrieve number values', () => {
      const key = 'number-key';
      const value = 42;

      cacheService.set(key, value);
      const retrieved = cacheService.get<number>(key);

      expect(retrieved).toBe(value);
    });

    it('should store and retrieve array values', () => {
      const key = 'array-key';
      const value = [1, 2, 3, 4, 5];

      cacheService.set(key, value);
      const retrieved = cacheService.get<number[]>(key);

      expect(retrieved).toEqual(value);
    });

    it('should store and retrieve complex objects', () => {
      const key = 'complex-key';
      const value = {
        id: 123,
        name: 'test',
        metadata: {
          tags: ['a', 'b', 'c'],
          count: 5,
        },
      };

      cacheService.set(key, value);
      const retrieved = cacheService.get(key);

      expect(retrieved).toEqual(value);
    });

    it('should handle multiple entries', () => {
      const entries = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'key3', value: 'value3' },
      ];

      entries.forEach(({ key, value }) => {
        cacheService.set(key, value);
      });

      entries.forEach(({ key, value }) => {
        expect(cacheService.get(key)).toBe(value);
      });
    });

    it('should update existing values', () => {
      const key = 'update-key';
      const initialValue = 'initial';
      const updatedValue = 'updated';

      cacheService.set(key, initialValue);
      expect(cacheService.get(key)).toBe(initialValue);

      cacheService.set(key, updatedValue);
      expect(cacheService.get(key)).toBe(updatedValue);
    });
  });

  describe('TTL expiration', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should use default TTL of 1 hour (3600000ms)', () => {
      const key = 'default-ttl-key';
      const value = 'test-value';

      cacheService.set(key, value);

      // Advance time by 59 minutes (not expired yet)
      jest.advanceTimersByTime(59 * 60 * 1000);
      expect(cacheService.get(key)).toBe(value);

      // Advance time by 2 more minutes (total 61 minutes - expired)
      jest.advanceTimersByTime(2 * 60 * 1000);
      expect(cacheService.get(key)).toBeNull();
    });

    it('should respect custom TTL values', () => {
      const key = 'custom-ttl-key';
      const value = 'test-value';
      const customTTL = 5000; // 5 seconds

      cacheService.set(key, value, customTTL);

      // Advance time by 4 seconds (not expired yet)
      jest.advanceTimersByTime(4000);
      expect(cacheService.get(key)).toBe(value);

      // Advance time by 2 more seconds (total 6 seconds - expired)
      jest.advanceTimersByTime(2000);
      expect(cacheService.get(key)).toBeNull();
    });

    it('should handle very short TTL values', () => {
      const key = 'short-ttl-key';
      const value = 'test-value';
      const shortTTL = 100; // 100ms

      cacheService.set(key, value, shortTTL);

      // Immediately check - should still be valid
      expect(cacheService.get(key)).toBe(value);

      // Advance time by 101ms (expired)
      jest.advanceTimersByTime(101);
      expect(cacheService.get(key)).toBeNull();
    });

    it('should handle very long TTL values', () => {
      const key = 'long-ttl-key';
      const value = 'test-value';
      const longTTL = 24 * 60 * 60 * 1000; // 24 hours

      cacheService.set(key, value, longTTL);

      // Advance time by 23 hours (not expired)
      jest.advanceTimersByTime(23 * 60 * 60 * 1000);
      expect(cacheService.get(key)).toBe(value);

      // Advance time by 2 more hours (total 25 hours - expired)
      jest.advanceTimersByTime(2 * 60 * 60 * 1000);
      expect(cacheService.get(key)).toBeNull();
    });

    it('should remove expired entries on get', () => {
      const key = 'auto-remove-key';
      const value = 'test-value';
      const ttl = 1000;

      cacheService.set(key, value, ttl);

      // Verify entry exists
      expect(cacheService.get(key)).toBe(value);

      // Advance past TTL
      jest.advanceTimersByTime(1001);

      // First get should return null and remove the entry
      expect(cacheService.get(key)).toBeNull();

      // Subsequent gets should also return null
      expect(cacheService.get(key)).toBeNull();
    });

    it('should handle multiple entries with different TTLs', () => {
      const entry1 = { key: 'key1', value: 'value1', ttl: 1000 };
      const entry2 = { key: 'key2', value: 'value2', ttl: 2000 };
      const entry3 = { key: 'key3', value: 'value3', ttl: 3000 };

      cacheService.set(entry1.key, entry1.value, entry1.ttl);
      cacheService.set(entry2.key, entry2.value, entry2.ttl);
      cacheService.set(entry3.key, entry3.value, entry3.ttl);

      // After 1500ms - entry1 expired, others still valid
      jest.advanceTimersByTime(1500);
      expect(cacheService.get(entry1.key)).toBeNull();
      expect(cacheService.get(entry2.key)).toBe(entry2.value);
      expect(cacheService.get(entry3.key)).toBe(entry3.value);

      // After 1000ms more (2500ms total) - entry2 expired, entry3 still valid
      jest.advanceTimersByTime(1000);
      expect(cacheService.get(entry1.key)).toBeNull();
      expect(cacheService.get(entry2.key)).toBeNull();
      expect(cacheService.get(entry3.key)).toBe(entry3.value);

      // After 1000ms more (3500ms total) - all expired
      jest.advanceTimersByTime(1000);
      expect(cacheService.get(entry1.key)).toBeNull();
      expect(cacheService.get(entry2.key)).toBeNull();
      expect(cacheService.get(entry3.key)).toBeNull();
    });

    it('should reset TTL when updating an entry', () => {
      const key = 'reset-ttl-key';
      const value1 = 'value1';
      const value2 = 'value2';
      const ttl = 2000;

      cacheService.set(key, value1, ttl);

      // Advance time by 1500ms
      jest.advanceTimersByTime(1500);

      // Update the entry (resets TTL)
      cacheService.set(key, value2, ttl);

      // Advance time by another 1500ms (3000ms total from start, but 1500ms from update)
      jest.advanceTimersByTime(1500);

      // Should still be valid since TTL was reset
      expect(cacheService.get(key)).toBe(value2);

      // Advance time by 1000ms more (would have expired with original TTL)
      jest.advanceTimersByTime(1000);

      // Should now be expired (2500ms from update)
      expect(cacheService.get(key)).toBeNull();
    });
  });

  describe('cache miss scenarios', () => {
    it('should return null for non-existent keys', () => {
      const result = cacheService.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should return null for expired entries', () => {
      jest.useFakeTimers();

      const key = 'expired-key';
      const value = 'test-value';
      const ttl = 1000;

      cacheService.set(key, value, ttl);

      // Advance past TTL
      jest.advanceTimersByTime(1001);

      expect(cacheService.get(key)).toBeNull();
    });

    it('should handle gets on empty cache', () => {
      const result1 = cacheService.get('key1');
      const result2 = cacheService.get('key2');
      const result3 = cacheService.get('key3');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBeNull();
    });

    it('should return null after entry has been removed by expiration', () => {
      jest.useFakeTimers();

      const key = 'test-key';
      const value = 'test-value';

      cacheService.set(key, value, 1000);

      // Verify it exists
      expect(cacheService.get(key)).toBe(value);

      // Expire it
      jest.advanceTimersByTime(1001);

      // Multiple gets should all return null
      expect(cacheService.get(key)).toBeNull();
      expect(cacheService.get(key)).toBeNull();
      expect(cacheService.get(key)).toBeNull();
    });
  });

  describe('invalidate functionality', () => {
    it('should remove a specific entry', () => {
      const key = 'test-key';
      const value = 'test-value';

      cacheService.set(key, value);
      expect(cacheService.get(key)).toBe(value);

      cacheService.invalidate(key);
      expect(cacheService.get(key)).toBeNull();
    });

    it('should only remove the specified entry', () => {
      const entries = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'key3', value: 'value3' },
      ];

      entries.forEach(({ key, value }) => {
        cacheService.set(key, value);
      });

      // Invalidate only key2
      cacheService.invalidate('key2');

      expect(cacheService.get('key1')).toBe('value1');
      expect(cacheService.get('key2')).toBeNull();
      expect(cacheService.get('key3')).toBe('value3');
    });

    it('should handle invalidating non-existent keys gracefully', () => {
      // Should not throw an error
      expect(() => {
        cacheService.invalidate('non-existent-key');
      }).not.toThrow();
    });

    it('should handle invalidating already invalidated keys', () => {
      const key = 'test-key';
      const value = 'test-value';

      cacheService.set(key, value);
      cacheService.invalidate(key);

      // Should not throw when invalidating again
      expect(() => {
        cacheService.invalidate(key);
      }).not.toThrow();

      expect(cacheService.get(key)).toBeNull();
    });

    it('should allow re-setting a key after invalidation', () => {
      const key = 'test-key';
      const value1 = 'value1';
      const value2 = 'value2';

      cacheService.set(key, value1);
      cacheService.invalidate(key);
      expect(cacheService.get(key)).toBeNull();

      cacheService.set(key, value2);
      expect(cacheService.get(key)).toBe(value2);
    });

    it('should invalidate entries regardless of expiration status', () => {
      jest.useFakeTimers();

      const key = 'test-key';
      const value = 'test-value';

      cacheService.set(key, value, 10000); // Long TTL

      // Invalidate before expiration
      cacheService.invalidate(key);
      expect(cacheService.get(key)).toBeNull();
    });
  });

  describe('clear functionality', () => {
    it('should remove all entries from the cache', () => {
      const entries = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'key3', value: 'value3' },
        { key: 'key4', value: 'value4' },
      ];

      entries.forEach(({ key, value }) => {
        cacheService.set(key, value);
      });

      // Verify all entries exist
      entries.forEach(({ key, value }) => {
        expect(cacheService.get(key)).toBe(value);
      });

      cacheService.clear();

      // Verify all entries are gone
      entries.forEach(({ key }) => {
        expect(cacheService.get(key)).toBeNull();
      });
    });

    it('should handle clearing an empty cache', () => {
      expect(() => {
        cacheService.clear();
      }).not.toThrow();
    });

    it('should handle clearing a cache multiple times', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');

      cacheService.clear();
      cacheService.clear();
      cacheService.clear();

      expect(cacheService.get('key1')).toBeNull();
      expect(cacheService.get('key2')).toBeNull();
    });

    it('should allow adding entries after clearing', () => {
      // Add initial entries
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');

      // Clear cache
      cacheService.clear();

      // Add new entries
      cacheService.set('key3', 'value3');
      cacheService.set('key4', 'value4');

      expect(cacheService.get('key1')).toBeNull();
      expect(cacheService.get('key2')).toBeNull();
      expect(cacheService.get('key3')).toBe('value3');
      expect(cacheService.get('key4')).toBe('value4');
    });

    it('should clear entries with different TTLs', () => {
      jest.useFakeTimers();

      cacheService.set('key1', 'value1', 1000);
      cacheService.set('key2', 'value2', 5000);
      cacheService.set('key3', 'value3', 10000);

      cacheService.clear();

      expect(cacheService.get('key1')).toBeNull();
      expect(cacheService.get('key2')).toBeNull();
      expect(cacheService.get('key3')).toBeNull();
    });
  });

  describe('custom TTL values', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should accept TTL of 0 (immediate expiration)', () => {
      const key = 'zero-ttl-key';
      const value = 'test-value';

      cacheService.set(key, value, 0);

      // Should be expired immediately
      expect(cacheService.get(key)).toBeNull();
    });

    it('should accept very small TTL values', () => {
      const key = 'small-ttl-key';
      const value = 'test-value';
      const ttl = 1; // 1ms

      cacheService.set(key, value, ttl);

      // Should still be valid immediately
      expect(cacheService.get(key)).toBe(value);

      // Should expire after 2ms
      jest.advanceTimersByTime(2);
      expect(cacheService.get(key)).toBeNull();
    });

    it('should handle different TTL values for different entries', () => {
      const shortTTL = { key: 'short', value: 'short-lived', ttl: 100 };
      const mediumTTL = { key: 'medium', value: 'medium-lived', ttl: 1000 };
      const longTTL = { key: 'long', value: 'long-lived', ttl: 10000 };

      cacheService.set(shortTTL.key, shortTTL.value, shortTTL.ttl);
      cacheService.set(mediumTTL.key, mediumTTL.value, mediumTTL.ttl);
      cacheService.set(longTTL.key, longTTL.value, longTTL.ttl);

      // All should be valid initially
      expect(cacheService.get(shortTTL.key)).toBe(shortTTL.value);
      expect(cacheService.get(mediumTTL.key)).toBe(mediumTTL.value);
      expect(cacheService.get(longTTL.key)).toBe(longTTL.value);

      // After 150ms
      jest.advanceTimersByTime(150);
      expect(cacheService.get(shortTTL.key)).toBeNull();
      expect(cacheService.get(mediumTTL.key)).toBe(mediumTTL.value);
      expect(cacheService.get(longTTL.key)).toBe(longTTL.value);

      // After 1050ms total
      jest.advanceTimersByTime(900);
      expect(cacheService.get(shortTTL.key)).toBeNull();
      expect(cacheService.get(mediumTTL.key)).toBeNull();
      expect(cacheService.get(longTTL.key)).toBe(longTTL.value);

      // After 10050ms total
      jest.advanceTimersByTime(9000);
      expect(cacheService.get(shortTTL.key)).toBeNull();
      expect(cacheService.get(mediumTTL.key)).toBeNull();
      expect(cacheService.get(longTTL.key)).toBeNull();
    });

    it('should use default TTL when TTL parameter is undefined', () => {
      const key = 'default-key';
      const value = 'test-value';

      cacheService.set(key, value, undefined);

      // Should use default TTL of 1 hour
      jest.advanceTimersByTime(59 * 60 * 1000);
      expect(cacheService.get(key)).toBe(value);

      jest.advanceTimersByTime(2 * 60 * 1000);
      expect(cacheService.get(key)).toBeNull();
    });

    it('should use default TTL when TTL parameter is not provided', () => {
      const key = 'default-key';
      const value = 'test-value';

      cacheService.set(key, value);

      // Should use default TTL of 1 hour
      jest.advanceTimersByTime(59 * 60 * 1000);
      expect(cacheService.get(key)).toBe(value);

      jest.advanceTimersByTime(2 * 60 * 1000);
      expect(cacheService.get(key)).toBeNull();
    });
  });

  describe('edge cases and type safety', () => {
    it('should handle null values', () => {
      const key = 'null-key';
      const value = null;

      cacheService.set(key, value);
      expect(cacheService.get(key)).toBeNull();
    });

    it('should handle undefined values', () => {
      const key = 'undefined-key';
      const value = undefined;

      cacheService.set(key, value);
      expect(cacheService.get(key)).toBe(undefined);
    });

    it('should handle boolean values', () => {
      cacheService.set('true-key', true);
      cacheService.set('false-key', false);

      expect(cacheService.get<boolean>('true-key')).toBe(true);
      expect(cacheService.get<boolean>('false-key')).toBe(false);
    });

    it('should handle empty strings', () => {
      const key = 'empty-string-key';
      const value = '';

      cacheService.set(key, value);
      expect(cacheService.get(key)).toBe('');
    });

    it('should handle empty objects', () => {
      const key = 'empty-object-key';
      const value = {};

      cacheService.set(key, value);
      expect(cacheService.get(key)).toEqual({});
    });

    it('should handle empty arrays', () => {
      const key = 'empty-array-key';
      const value: any[] = [];

      cacheService.set(key, value);
      expect(cacheService.get(key)).toEqual([]);
    });
  });
});
