import { apiClient } from "./api-client";
import { fetchAllPages } from "./fetch-all-pages";

export interface FinancialYear {
  id: number;
  reporting_duration: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_current: boolean;
  reporting_frequency: string;
  status: string;
  extension_date: string | null;
  extension_reason: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialYearRequest {
  reporting_duration: number;
  name?: string;
  start_date: string;
  end_date: string;
  reporting_frequency?: string;
}

export interface FinancialYearResponse {
  results: FinancialYear[];
  count: number;
  next?: string;
  previous?: string;
}

class FinancialYearService {
  private endpoint = "/v1.0/planning/financial-years";

  /**
   * Get all financial years
   */
  async getFinancialYearsPaginated(page = 1, search = ""): Promise<FinancialYearResponse> {
    const params = new URLSearchParams({ page: String(page) });
    if (search.trim()) params.set("search", search.trim());
    return apiClient.get<FinancialYearResponse>(`${this.endpoint}/?${params.toString()}`);
  }

  async getFinancialYears(): Promise<FinancialYearResponse> {
    return fetchAllPages<FinancialYear>(`${this.endpoint}/`);
  }

  /**
   * Get financial year by ID
   */
  async getFinancialYear(id: number): Promise<FinancialYear> {
    return apiClient.get<FinancialYear>(`${this.endpoint}/${id}/`);
  }

  /**
   * Create a new financial year
   */
  async createFinancialYear(data: FinancialYearRequest): Promise<FinancialYear> {
    return apiClient.post<FinancialYear>(`${this.endpoint}/`, data);
  }

  /**
   * Update a financial year (PATCH)
   */
  async updateFinancialYear(
    id: number,
    data: Partial<FinancialYearRequest>
  ): Promise<FinancialYear> {
    return apiClient.patch<FinancialYear>(`${this.endpoint}/${id}/`, data);
  }

  /**
   * Delete a financial year
   */
  async deleteFinancialYear(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}/`);
  }

  async activateFinancialYear(id: number): Promise<FinancialYear> {
    const response = await apiClient.post<{ data?: FinancialYear } | FinancialYear>(
      `${this.endpoint}/${id}/activate/`,
      {}
    );
    return (response as { data?: FinancialYear }).data ?? (response as FinancialYear);
  }

  async closeFinancialYear(id: number): Promise<FinancialYear> {
    const response = await apiClient.post<{ data?: FinancialYear } | FinancialYear>(
      `${this.endpoint}/${id}/close/`,
      {}
    );
    return (response as { data?: FinancialYear }).data ?? (response as FinancialYear);
  }

  async setCurrentFinancialYear(id: number): Promise<FinancialYear> {
    const response = await apiClient.post<{ data?: FinancialYear } | FinancialYear>(
      `${this.endpoint}/${id}/sync-quarters/`,
      {}
    );
    return (response as { data?: FinancialYear }).data ?? (response as FinancialYear);
  }
}

export const financialYearService = new FinancialYearService();
