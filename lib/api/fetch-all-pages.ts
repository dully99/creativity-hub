import { apiClient } from "./api-client";

interface Paged<T> {
  results?: T[];
  count?: number;
  data?: Paged<T> | T[];
}

function pageOf<T>(response: Paged<T> | T[]): { results: T[]; count: number } {
  if (Array.isArray(response)) return { results: response, count: response.length };
  if (response?.data && !Array.isArray(response.data) && Array.isArray(response.data.results)) {
    return {
      results: response.data.results,
      count: response.data.count ?? response.data.results.length,
    };
  }
  if (response?.data && Array.isArray(response.data)) {
    return { results: response.data, count: response.data.length };
  }
  const results = response?.results ?? [];
  return { results, count: response?.count ?? results.length };
}

/** Load every page (page size 100) so dropdowns are not limited to the first page. */
export async function fetchAllPages<T>(
  endpoint: string,
  extra?: Record<string, string>,
): Promise<{ results: T[]; count: number }> {
  const all: T[] = [];
  let page = 1;
  let count = 0;
  while (page <= 200) {
    const params = new URLSearchParams({ page: String(page), page_size: "100" });
    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
    }
    const response = await apiClient.get<Paged<T> | T[]>(`${endpoint}?${params.toString()}`);
    const chunk = pageOf(response);
    count = chunk.count;
    all.push(...chunk.results);
    if (chunk.results.length < 100 || all.length >= count) break;
    page += 1;
  }
  return { results: all, count: all.length };
}
