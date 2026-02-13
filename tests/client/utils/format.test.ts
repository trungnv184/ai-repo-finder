import { formatNumber } from '../../../src/client/utils/formatNumber';
import { formatRelativeDate } from '../../../src/client/utils/formatDate';

describe('formatNumber', () => {
  it('should return "0" for zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should return plain number for values under 1000', () => {
    expect(formatNumber(1)).toBe('1');
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(500)).toBe('500');
  });

  it('should format 1000 as "1k"', () => {
    expect(formatNumber(1000)).toBe('1k');
  });

  it('should format 1500 as "1.5k"', () => {
    expect(formatNumber(1500)).toBe('1.5k');
  });

  it('should format 12500 as "12.5k"', () => {
    expect(formatNumber(12500)).toBe('12.5k');
  });

  it('should format values in the thousands range', () => {
    expect(formatNumber(2000)).toBe('2k');
    expect(formatNumber(9999)).toBe('10k');
    expect(formatNumber(10000)).toBe('10k');
    expect(formatNumber(99999)).toBe('100k');
  });

  it('should format 1000000 as "1M"', () => {
    expect(formatNumber(1000000)).toBe('1M');
  });

  it('should format values in the millions range', () => {
    expect(formatNumber(1500000)).toBe('1.5M');
    expect(formatNumber(2000000)).toBe('2M');
    expect(formatNumber(10000000)).toBe('10M');
  });

  it('should handle negative numbers', () => {
    expect(formatNumber(-1)).toBe('-1');
    expect(formatNumber(-999)).toBe('-999');
    expect(formatNumber(-1000)).toBe('-1k');
    expect(formatNumber(-1500)).toBe('-1.5k');
    expect(formatNumber(-1000000)).toBe('-1M');
  });

  it('should truncate to one decimal place', () => {
    expect(formatNumber(1234)).toBe('1.2k');
    expect(formatNumber(1290)).toBe('1.3k');
  });
});

describe('formatRelativeDate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return "just now" for dates less than 60 seconds ago', () => {
    expect(formatRelativeDate('2024-06-15T11:59:30Z')).toBe('just now');
    expect(formatRelativeDate('2024-06-15T11:59:59Z')).toBe('just now');
    expect(formatRelativeDate('2024-06-15T12:00:00Z')).toBe('just now');
  });

  it('should return minutes ago for dates between 1-59 minutes ago', () => {
    expect(formatRelativeDate('2024-06-15T11:59:00Z')).toBe('1 minute ago');
    expect(formatRelativeDate('2024-06-15T11:55:00Z')).toBe('5 minutes ago');
    expect(formatRelativeDate('2024-06-15T11:30:00Z')).toBe('30 minutes ago');
    expect(formatRelativeDate('2024-06-15T11:01:00Z')).toBe('59 minutes ago');
  });

  it('should use singular form for 1 minute', () => {
    expect(formatRelativeDate('2024-06-15T11:59:00Z')).toBe('1 minute ago');
  });

  it('should return hours ago for dates between 1-23 hours ago', () => {
    expect(formatRelativeDate('2024-06-15T11:00:00Z')).toBe('1 hour ago');
    expect(formatRelativeDate('2024-06-15T06:00:00Z')).toBe('6 hours ago');
    expect(formatRelativeDate('2024-06-14T13:00:00Z')).toBe('23 hours ago');
  });

  it('should use singular form for 1 hour', () => {
    expect(formatRelativeDate('2024-06-15T11:00:00Z')).toBe('1 hour ago');
  });

  it('should return days ago for dates between 1-29 days ago', () => {
    expect(formatRelativeDate('2024-06-14T12:00:00Z')).toBe('1 day ago');
    expect(formatRelativeDate('2024-06-08T12:00:00Z')).toBe('7 days ago');
    expect(formatRelativeDate('2024-05-17T12:00:00Z')).toBe('29 days ago');
  });

  it('should use singular form for 1 day', () => {
    expect(formatRelativeDate('2024-06-14T12:00:00Z')).toBe('1 day ago');
  });

  it('should return months ago for dates between 1-11 months ago', () => {
    expect(formatRelativeDate('2024-05-15T12:00:00Z')).toBe('1 month ago');
    expect(formatRelativeDate('2024-03-15T12:00:00Z')).toBe('3 months ago');
    expect(formatRelativeDate('2023-08-15T12:00:00Z')).toBe('10 months ago');
  });

  it('should use singular form for 1 month', () => {
    expect(formatRelativeDate('2024-05-15T12:00:00Z')).toBe('1 month ago');
  });

  it('should return years ago for dates 12+ months ago', () => {
    expect(formatRelativeDate('2023-06-15T12:00:00Z')).toBe('1 year ago');
    expect(formatRelativeDate('2022-06-15T12:00:00Z')).toBe('2 years ago');
    expect(formatRelativeDate('2019-06-15T12:00:00Z')).toBe('5 years ago');
  });

  it('should use singular form for 1 year', () => {
    expect(formatRelativeDate('2023-06-15T12:00:00Z')).toBe('1 year ago');
  });
});
