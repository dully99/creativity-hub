import { apiClient } from "./api-client";

export interface Target {
  id: number;
  objective: number;
  objective_name?: string;
  objective_names?: string[];
  objective_ids?: number[];
  responsible_division: number;
  division_name?: string;
  responsible_division_name?: string;
  responsible_officer_position?: number;
  responsible_officer_position_name?: string;
  name: string;
  description: string | null;
  code?: string;
  data_type?: string | null;
  target_value?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

export interface TargetRequest {
  name: string;
  code?: string;
  description?: string;
  objective: number;
  responsible_division: number;
}

export interface TargetResponse {
  results: Target[];
  count: number;
  next?: string;
  previous?: string;
}

import { fetchAllPages } from "./fetch-all-pages";

class TargetService {
  private endpoint = "/v1.0/planning/targets";

  async getTargetsPaginated(page = 1, search = ""): Promise<TargetResponse> {
    const params = new URLSearchParams({ page: String(page) });
    if (search.trim()) params.set("search", search.trim());
    return apiClient.get<TargetResponse>(`${this.endpoint}/?${params.toString()}`);
  }

  async getTargets(search = ""): Promise<TargetResponse> {
    return fetchAllPages<Target>(`${this.endpoint}/`, { search: search.trim() });
  }

  async getTarget(id: number): Promise<Target> {
    return apiClient.get<Target>(`${this.endpoint}/${id}/`);
  }

  async createTarget(data: TargetRequest): Promise<Target> {
    return apiClient.post<Target>(`${this.endpoint}/`, data);
  }

  async updateTarget(
    id: number,
    data: Partial<TargetRequest>,
  ): Promise<Target> {
    return apiClient.patch<Target>(`${this.endpoint}/${id}/`, data);
  }

  async deleteTarget(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}/`);
  }
}

export const targetService = new TargetService();
