export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

export function parsePagination(query: Record<string, unknown>) {
  const page = Math.max(Number(query.page ?? DEFAULT_PAGE), DEFAULT_PAGE);
  const rawPageSize = Math.max(Number(query.pageSize ?? DEFAULT_PAGE_SIZE), 1);
  const pageSize = Math.min(rawPageSize, MAX_PAGE_SIZE);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize
  };
}
