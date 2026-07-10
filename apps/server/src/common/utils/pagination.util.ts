export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

type PaginationQuery = {
  page?: number;
  pageSize?: number;
};

export function parsePagination(query: PaginationQuery) {
  const page = Math.max(query.page ?? DEFAULT_PAGE, DEFAULT_PAGE);
  const rawPageSize = Math.max(query.pageSize ?? DEFAULT_PAGE_SIZE, 1);
  const pageSize = Math.min(rawPageSize, MAX_PAGE_SIZE);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize
  };
}

export type Pagination = ReturnType<typeof parsePagination>;
