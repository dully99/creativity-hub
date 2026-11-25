import { apiClient } from "./api-client";
import { fetchAllPages } from "./fetch-all-pages";

export interface Activity {
  id: number;
  target: number;
  target_name?: string;
  financial_year: number;
  financial_year_name?: string;
  section?: number | null;
  section_name?: string | null;
  name: string;
  code?: string;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

export interface ActivityRequest {
  name: string;
  code?: string;
  description?: string;
  target: number;
  financial_year: number;
  section?: number | null;
  is_active?: boolean;
}

export interface ActivityUpdateRequest {
  target?: number;
  financial_year?: number;
  section?: number | null;
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface ActivityResponse {
  results: Activity[];
  count: number;
  next?: string;
  previous?: string;
}

class ActivityService {
  private endpoint = "/v1.0/planning/activities";

  async getActivitiesPaginated(page = 1, search = ""): Promise<ActivityResponse> {
    const params = new URLSearchParams({ page: String(page) });
    if (search.trim()) params.set("search", search.trim());
    return apiClient.get<ActivityResponse>(`${this.endpoint}/?${params.toString()}`);
  }

  async getActivities(search = ""): Promise<ActivityResponse> {
    return fetchAllPages<Activity>(`${this.endpoint}/`, { search: search.trim() });
  }

  async getActivity(id: number): Promise<Activity> {
    return apiClient.get<Activity>(`${this.endpoint}/${id}/`);
  }

  async createActivity(data: ActivityRequest): Promise<Activity> {
    return apiClient.post<Activity>(`${this.endpoint}/`, data);
  }

  async updateActivity(id: number, data: ActivityUpdateRequest): Promise<Activity> {
    return apiClient.patch<Activity>(`${this.endpoint}/${id}/`, data);
  }

  async deleteActivity(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}/`);
  }
}

export const activityService = new ActivityService();
