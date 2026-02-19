/**
 * Pagination utilities shared by API routes and client components.
 * This module is client-safe — no server-only imports.
 */

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function parsePaginationParams(
  searchParams: URLSearchParams,
  opts?: { defaultLimit?: number; maxLimit?: number },
): PaginationParams {
  const defaultLimit = opts?.defaultLimit ?? 20;
  const maxLimit = opts?.maxLimit ?? 100;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number(searchParams.get("limit")) || defaultLimit));
  return { page, limit, offset: (page - 1) * limit };
}

/**
 * Build visible page numbers for pagination UI.
 * Always shows first, last, current, and neighbors; uses -1 as ellipsis marker.
 */
export function buildVisiblePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);

  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: number[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push(-1); // ellipsis
    }
    result.push(sorted[i]);
  }

  return result;
}

/**
 * Update URLSearchParams for pagination navigation.
 */
export function updatePaginationSearchParams(
  searchParams: URLSearchParams,
  opts: {
    currentPage?: number;
    totalPages?: number;
    limit?: number;
    nextPage?: number;
  },
): URLSearchParams {
  const params = new URLSearchParams(searchParams.toString());
  const page = opts.nextPage ?? opts.currentPage ?? 1;
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  if (opts.limit) {
    params.set("limit", String(opts.limit));
  }
  return params;
}
