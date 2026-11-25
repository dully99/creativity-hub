import { apiClient } from "./api-client";

export interface TaskQuarter {
  id: number;
  name?: string;
  start_date?: string;
  end_date?: string;
}

export interface Task {
  id: number;
  activity: number;
  activity_name?: string;
  name: string;
  code?: string;
  description?: string | null;
  status: string;
  progress?: number;
  reporting_frequency?: string;
  data_type?: string;
  target_value?: number | null;
  weekly_reporting_open_day?: number | null;
  weekly_reporting_close_day?: number | null;
  implementation_quarters?: Array<number | TaskQuarter>;
  implementation_quarters_names?: string[];
  is_active?: boolean;
  allow_late_report?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

export interface TaskRequest {
  name: string;
  activity: number;
  implementation_quarters?: number[];
  description?: string;
  reporting_frequency?: string;
  data_type: string;
  target_value?: number | null;
  weekly_reporting_open_day?: number | null;
  weekly_reporting_close_day?: number | null;
  is_active?: boolean;
}

export interface TaskUpdateRequest {
  activity?: number;
  implementation_quarters?: number[];
  name?: string;
  description?: string;
  reporting_frequency?: string;
  data_type?: string;
  target_value?: number | null;
  weekly_reporting_open_day?: number | null;
  weekly_reporting_close_day?: number | null;
  progress?: number;
  status?: string;
  is_active?: boolean;
  allow_late_report?: boolean;
}

export interface TaskResponse {
  results: Task[];
  count: number;
  next?: string;
  previous?: string;
}

class TaskService {
  private endpoint = "/v1.0/planning/tasks";

  async getTasksPaginated(page = 1, search = ""): Promise<TaskResponse> {
    const params = new URLSearchParams({ page: String(page) });
    if (search.trim()) params.set("search", search.trim());
    return apiClient.get<TaskResponse>(`${this.endpoint}/?${params.toString()}`);
  }

  async getTasks(): Promise<TaskResponse> {
    return apiClient.get<TaskResponse>(`${this.endpoint}/`);
  }

  async getTask(id: number): Promise<Task> {
    return apiClient.get<Task>(`${this.endpoint}/${id}/`);
  }

  async createTask(data: TaskRequest): Promise<Task> {
    return apiClient.post<Task>(`${this.endpoint}/`, data);
  }

  async updateTask(id: number, data: TaskUpdateRequest): Promise<Task> {
    return apiClient.patch<Task>(`${this.endpoint}/${id}/`, data);
  }

  async deleteTask(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}/`);
  }
}

export const taskService = new TaskService();
