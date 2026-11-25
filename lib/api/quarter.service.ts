import { apiClient } from "./api-client";
import { fetchAllPages } from "./fetch-all-pages";

export interface Quarter {
  id: number;
  financial_year: number;
  financial_year_name?: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_current: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface QuarterRequest {
  financial_year: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  is_current?: boolean;
}

export interface QuarterResponse {
  results: Quarter[];
  count: number;
  next?: string;
  previous?: string;
}

class QuarterService {
  private endpoint = "/v1.0/planning/quarters";

  async getQuartersPaginated(page = 1, search = ""): Promise<QuarterResponse> {
    const params = new URLSearchParams({ page: String(page) });
    if (search.trim()) params.set("search", search.trim());
    return apiClient.get<QuarterResponse>(`${this.endpoint}/?${params.toString()}`);
  }

  async getQuarters(): Promise<QuarterResponse> {
    return fetchAllPages<Quarter>(`${this.endpoint}/`);
  }

  async getQuarter(id: number): Promise<Quarter> {
    return apiClient.get<Quarter>(`${this.endpoint}/${id}/`);
  }

  async createQuarter(data: QuarterRequest): Promise<Quarter> {
    return apiClient.post<Quarter>(`${this.endpoint}/`, data);
  }

  async updateQuarter(id: number, data: Partial<QuarterRequest>): Promise<Quarter> {
    return apiClient.patch<Quarter>(`${this.endpoint}/${id}/`, data);
  }

  async deleteQuarter(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}/`);
  }

  async activateQuarter(id: number): Promise<Quarter> {
    const response = await apiClient.post<{ data?: Quarter } | Quarter>(
      `${this.endpoint}/${id}/activate/`,
      {}
    );
    return (response as { data?: Quarter }).data ?? (response as Quarter);
  }

  async closeQuarter(id: number): Promise<Quarter> {
    const response = await apiClient.post<{ data?: Quarter } | Quarter>(
      `${this.endpoint}/${id}/close/`,
      {}
    );
    return (response as { data?: Quarter }).data ?? (response as Quarter);
  }

  async setCurrentQuarter(id: number): Promise<Quarter> {
    const response = await apiClient.post<{ data?: Quarter } | Quarter>(
      `${this.endpoint}/${id}/set-current/`,
      {}
    );
    return (response as { data?: Quarter }).data ?? (response as Quarter);
  }
}

export const quarterService = new QuarterService();
