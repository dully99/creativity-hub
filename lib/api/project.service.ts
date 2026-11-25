import { apiClient } from "./api-client";
import { fetchAllPages } from "./fetch-all-pages";

export interface ProjectDivision {
  id: number;
  name: string;
  code?: string;
  type?: string;
}

export interface Project {
  id: number;
  plan_budget_type: number;
  plan_budget_type_name?: string;
  reporting_duration: number;
  reporting_duration_name?: string;
  responsible_divisions?: ProjectDivision[] | number[];
  name: string;
  description: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectRequest {
  plan_budget_type: number;
  reporting_duration: number;
  responsible_divisions: number[];
  name: string;
  description?: string;
  is_active: boolean;
}

export interface ProjectResponse {
  results: Project[];
  count: number;
  next?: string;
  previous?: string;
}

class ProjectService {
  private endpoint = "/v1.0/planning/projects";

  async getProjectsPaginated(page = 1, search = ""): Promise<ProjectResponse> {
    const params = new URLSearchParams({ page: String(page) });
    if (search.trim()) params.set("search", search.trim());
    return apiClient.get<ProjectResponse>(`${this.endpoint}/?${params.toString()}`);
  }

  async getProjects(search = ""): Promise<ProjectResponse> {
    return fetchAllPages<Project>(`${this.endpoint}/`, { search: search.trim() });
  }

  async getProject(id: number): Promise<Project> {
    return apiClient.get<Project>(`${this.endpoint}/${id}/`);
  }

  async createProject(data: ProjectRequest): Promise<Project> {
    return apiClient.post<Project>(`${this.endpoint}/`, data);
  }

  async updateProject(id: number, data: Partial<ProjectRequest>): Promise<Project> {
    return apiClient.patch<Project>(`${this.endpoint}/${id}/`, data);
  }

  async deleteProject(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}/`);
  }
}

export const projectService = new ProjectService();
