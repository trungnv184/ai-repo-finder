import { Request, Response, NextFunction } from 'express';
import type { SortField, SortOrder } from '../../shared/types';

const VALID_SORT_FIELDS: SortField[] = ['stars', 'forks', 'updated', 'name'];
const VALID_SORT_ORDERS: SortOrder[] = ['asc', 'desc'];

/**
 * Sanitizes a search query string by removing potentially dangerous characters.
 * Allows alphanumerics, spaces, hyphens, underscores, and dots.
 */
function sanitizeQuery(query: string): string {
  return query.replace(/[^\w\s\-.\+]/g, '').trim();
}

/**
 * Validation middleware for repository search query parameters.
 * Validates and sanitizes: query, sort, order, page, per_page.
 * Sets validated values on req.query for downstream handlers.
 */
export function validateRepoQuery(req: Request, res: Response, next: NextFunction): void {
  // Validate sort field
  const sortField = req.query.sort as string | undefined;
  if (sortField && !VALID_SORT_FIELDS.includes(sortField as SortField)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: `Invalid sort field "${sortField}". Must be one of: ${VALID_SORT_FIELDS.join(', ')}`,
      },
      meta: {
        timestamp: new Date().toISOString(),
        fromCache: false,
      },
    });
    return;
  }

  // Validate sort order
  const sortOrder = req.query.order as string | undefined;
  if (sortOrder && !VALID_SORT_ORDERS.includes(sortOrder as SortOrder)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: `Invalid sort order "${sortOrder}". Must be one of: ${VALID_SORT_ORDERS.join(', ')}`,
      },
      meta: {
        timestamp: new Date().toISOString(),
        fromCache: false,
      },
    });
    return;
  }

  // Validate page
  const page = req.query.page as string | undefined;
  if (page !== undefined) {
    const pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum < 1 || !Number.isInteger(pageNum)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Page must be a positive integer.',
        },
        meta: {
          timestamp: new Date().toISOString(),
          fromCache: false,
        },
      });
      return;
    }
  }

  // Validate per_page
  const perPage = req.query.per_page as string | undefined;
  if (perPage !== undefined) {
    const perPageNum = parseInt(perPage, 10);
    if (isNaN(perPageNum) || perPageNum < 1 || perPageNum > 50 || !Number.isInteger(perPageNum)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'per_page must be an integer between 1 and 50.',
        },
        meta: {
          timestamp: new Date().toISOString(),
          fromCache: false,
        },
      });
      return;
    }
  }

  // Sanitize query string
  const query = req.query.q as string | undefined;
  if (query) {
    req.query.q = sanitizeQuery(query);
  }

  next();
}
