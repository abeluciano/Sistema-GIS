export function normalizePaginationQuery(query = {}) {
  const requestedPage = Math.max(1, Number.parseInt(String(query.page ?? "1"), 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(String(query.page_size ?? "10"), 10) || 10));
  return { requestedPage, pageSize };
}

export function buildPagination(totalValue, requestedPage, pageSize) {
  const total = Math.max(0, Number(totalValue) || 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);

  return {
    page,
    page_size: pageSize,
    total,
    total_pages: totalPages,
    offset: (page - 1) * pageSize
  };
}
