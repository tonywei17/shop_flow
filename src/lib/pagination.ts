export function buildVisiblePages(currentPage: number, totalPages: number): number[] {
  const pages: number[] = [];

  const add = (value: number) => {
    if (value >= 1 && value <= totalPages && !pages.includes(value)) {
      pages.push(value);
    }
  };

  add(1);
  add(totalPages);
  add(currentPage);
  add(currentPage - 1);
  add(currentPage + 1);

  return pages.sort((a, b) => a - b);
}

export type ParsedPagination = {
  page: number;
  limit: number;
  offset: number;
};

export type PaginationParamsOptions = {
  defaultLimit?: number;
  maxLimit?: number;
};

export function parsePaginationParams(
  searchParams: URLSearchParams,
  options: PaginationParamsOptions = {},
): ParsedPagination {
  const { defaultLimit = 20, maxLimit = 100 } = options;
  const pageParam = Number(searchParams.get("page"));
  const limitParam = Number(searchParams.get("limit"));

  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(Math.floor(limitParam), maxLimit)
      : defaultLimit;

  const page =
    Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;

  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export type PaginationSearchSource = URLSearchParams | { toString(): string };

export type UpdatePaginationSearchParamsOptions = {
  currentPage: number;
  totalPages: number;
  limit: number;
  nextPage?: number;
};

export function updatePaginationSearchParams(
  searchParams: PaginationSearchSource,
  options: UpdatePaginationSearchParamsOptions,
): URLSearchParams {
  const params = new URLSearchParams(searchParams.toString());
  const rawPage =
    typeof options.nextPage === "number" ? options.nextPage : options.currentPage;
  const safePage = Math.max(
    1,
    Math.min(options.totalPages, Math.floor(rawPage)),
  );

  params.set("page", String(safePage));
  params.set("limit", String(options.limit));

  return params;
}
