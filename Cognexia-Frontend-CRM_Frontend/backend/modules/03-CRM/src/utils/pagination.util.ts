export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/**
 * Normalize pagination options
 */
export function normalizePaginationOptions(options: Partial<PaginationOptions>): PaginationOptions {
  const page = Math.max(options.page || DEFAULT_PAGE, 1);
  const limit = Math.min(Math.max(options.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);

  return {
    page,
    limit,
    sort: options.sort || 'createdAt',
    order: options.order || 'DESC',
  };
}

/**
 * Calculate skip value for database queries
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMeta(
  page: number,
  limit: number,
  totalItems: number,
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalPages,
    totalItems,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Create paginated result
 */
export function createPaginatedResult<T>(
  data: T[],
  page: number,
  limit: number,
  totalItems: number,
): PaginatedResult<T> {
  return {
    data,
    meta: calculatePaginationMeta(page, limit, totalItems),
  };
}

/**
 * Extract pagination from query parameters
 */
export function extractPaginationFromQuery(query: Record<string, any>): PaginationOptions {
  return normalizePaginationOptions({
    page: parseInt(query.page, 10),
    limit: parseInt(query.limit, 10),
    sort: query.sort,
    order: query.order,
  });
}

/**
 * Generate pagination links
 */
export function generatePaginationLinks(
  baseUrl: string,
  page: number,
  totalPages: number,
): Record<string, string | null> {
  return {
    first: totalPages > 0 ? `${baseUrl}?page=1` : null,
    previous: page > 1 ? `${baseUrl}?page=${page - 1}` : null,
    next: page < totalPages ? `${baseUrl}?page=${page + 1}` : null,
    last: totalPages > 0 ? `${baseUrl}?page=${totalPages}` : null,
  };
}
