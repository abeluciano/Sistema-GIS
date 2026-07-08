import { buildPagination, normalizePaginationQuery } from "../src/utils/pagination.js";

describe("report pagination", () => {
  test("uses stable defaults", () => {
    expect(normalizePaginationQuery({})).toEqual({ requestedPage: 1, pageSize: 10 });
  });

  test("normalizes invalid values and limits page size", () => {
    expect(normalizePaginationQuery({ page: "-4", page_size: "1000" }))
      .toEqual({ requestedPage: 1, pageSize: 100 });
  });

  test("clamps pages and calculates offset", () => {
    expect(buildPagination(14, 9, 5)).toEqual({
      page: 3,
      page_size: 5,
      total: 14,
      total_pages: 3,
      offset: 10
    });
  });
});
