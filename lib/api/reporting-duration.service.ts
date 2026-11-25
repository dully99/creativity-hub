import { apiClient } from "./api-client";

export interface ReportingDuration {
  id: number;
  ministry_name: string;
  ministry_code: string;
  start_date: string;
  end_date: string;
  start_year: number;
  end_year: number;
  description: string | null;
  status: string;
  extension_date: string | null;
  extension_reason: string | null;
}

export interface ReportingDurationRequest {
  ministry: number;
  start_date: string;
  end_date: string;
  description?: string;
}

export interface ReportingDurationResponse {
  results: ReportingDuration[];
  count: number;
  next?: string;
  previous?: string;
}

class ReportingDurationService {
  private endpoint = "/v1.0/planning/reporting-durations";

  /**
   * Get all reporting durations
   */
  async getReportingDurationsPaginated(page = 1, search = ""): Promise<ReportingDurationResponse> {
    const params = new URLSearchParams({ page: String(page) });
    if (search.trim()) params.set("search", search.trim());
    return apiClient.get<ReportingDurationResponse>(`${this.endpoint}?${params.toString()}`);
  }

  async getReportingDurations(): Promise<ReportingDurationResponse> {
    return apiClient.get<ReportingDurationResponse>(this.endpoint);
  }

  /**
   * Get reporting duration by ID
   */
  async getReportingDuration(id: number): Promise<ReportingDuration> {
    return apiClient.get<ReportingDuration>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new reporting duration
   */
  async createReportingDuration(data: ReportingDurationRequest): Promise<ReportingDuration> {
    return apiClient.post<ReportingDuration>(`${this.endpoint}/`, data);
  }

  /**
   * Update a reporting duration (PATCH)
   */
  async updateReportingDuration(
    id: number,
    data: Partial<ReportingDurationRequest>
  ): Promise<ReportingDuration> {
    return apiClient.patch<ReportingDuration>(`${this.endpoint}/${id}/`, data);
  }

  /**
   * Delete a reporting duration
   */
  async deleteReportingDuration(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}/`);
  }

  /**
   * Activate a reporting duration
   */
  async activateReportingDuration(id: number): Promise<ReportingDuration> {
    const response = await apiClient.post<{ data?: ReportingDuration } | ReportingDuration>(
      `${this.endpoint}/${id}/activate/`,
      {}
    );
    return (response as { data?: ReportingDuration }).data ?? (response as ReportingDuration);
  }

  async closeReportingDuration(id: number): Promise<ReportingDuration> {
    const response = await apiClient.post<{ data?: ReportingDuration } | ReportingDuration>(
      `${this.endpoint}/${id}/close/`,
      {}
    );
    return (response as { data?: ReportingDuration }).data ?? (response as ReportingDuration);
  }
}

export const reportingDurationService = new ReportingDurationService();
