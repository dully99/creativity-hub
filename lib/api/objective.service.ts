import { apiClient } from "./api-client";
import { fetchAllPages } from "./fetch-all-pages";

export interface ObjectiveDivision {
  id: number;
  name: string;
  code?: string;
  type?: string;
}

export interface Objective {
  id: number;
  plan_budget_type: number;
  plan_budget_type_name?: string;
  project: number | null;
  project_name?: string | null;
  project_names?: string[];
  project_ids?: number[];
  reporting_duration: number;
  reporting_duration_name?: string;
  responsible_divisions: ObjectiveDivision[];
  name: string;
  code?: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

export interface ObjectiveRequest {
  plan_budget_type: number;
  project?: number;
  reporting_duration: number;
  responsible_divisions: number[];
  name: string;
  description?: string;
  display_order?: number;
  is_active: boolean;
}

export interface ObjectiveResponse {
  results: Objective[];
  count: number;
  next?: string;
  previous?: string;
}

class ObjectiveService {
  private endpoint = "/v1.0/planning/objectives";

  async getObjectivesPaginated(page = 1, search = ""): Promise<ObjectiveResponse> {
    const params = new URLSearchParams({ page: String(page) });
    if (search.trim()) params.set("search", search.trim());
    return apiClient.get<ObjectiveResponse>(`${this.endpoint}/?${params.toString()}`);
  }

  async getObjectives(search = ""): Promise<ObjectiveResponse> {
    return fetchAllPages<Objective>(`${this.endpoint}/`, { search: search.trim() });
  }

  async getObjective(id: number): Promise<Objective> {
    return apiClient.get<Objective>(`${this.endpoint}/${id}/`);
  }

  async createObjective(data: ObjectiveRequest): Promise<Objective> {
    return apiClient.post<Objective>(`${this.endpoint}/`, data);
  }

  async updateObjective(
    id: number,
    data: Partial<ObjectiveRequest>,
  ): Promise<Objective> {
    return apiClient.patch<Objective>(`${this.endpoint}/${id}/`, data);
  }

  async deleteObjective(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}/`);
  }
}

export const objectiveService = new ObjectiveService();
