import { apiClient } from "./api-client";

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  ministry: number;
  /** Preferred API field after Division rename */
  head_of_division?: number | null;
  /** Legacy alias still accepted by older clients */
  head_of_department?: number | null;
  head_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DepartmentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Department[];
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
  ministry: number;
  head_of_department?: number;
}

export interface UpdateDepartmentRequest {
  name?: string;
  code?: string;
  description?: string;
  is_active?: boolean;
  ministry?: number;
  head_of_department?: number;
}

export interface GetDepartmentsParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  ministry?: number;
  ordering?: string;
}

class DepartmentService {
  private endpoint = "/v1.0/departments";

  /**
   * Get all departments with optional filters
   */
  async getDepartments(params?: GetDepartmentsParams): Promise<DepartmentsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.is_active !== undefined) queryParams.append("is_active", params.is_active.toString());
      if (params?.ministry) queryParams.append("ministry", params.ministry.toString());
      if (params?.ordering) queryParams.append("ordering", params.ordering);

      const url = queryParams.toString() 
        ? `${this.endpoint}/?${queryParams.toString()}`
        : `${this.endpoint}/`;

      return await apiClient.get<DepartmentsResponse>(url);
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  }

  /**
   * Get a single department by ID
   */
  async getDepartment(id: number): Promise<Department> {
    try {
      return await apiClient.get<Department>(`${this.endpoint}/${id}/`);
    } catch (error) {
      console.error(`Error fetching department ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new department
   */
  async createDepartment(data: CreateDepartmentRequest): Promise<Department> {
    try {
      return await apiClient.post<Department>(`${this.endpoint}/`, data);
    } catch (error) {
      console.error("Error creating department:", error);
      throw error;
    }
  }

  /**
   * Update a department (partial update)
   */
  async updateDepartment(id: number, data: UpdateDepartmentRequest): Promise<Department> {
    try {
      return await apiClient.patch<Department>(`${this.endpoint}/${id}/`, data);
    } catch (error) {
      console.error(`Error updating department ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a department
   */
  async deleteDepartment(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}/`);
    } catch (error) {
      console.error(`Error deleting department ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activate a department
   */
  async activateDepartment(id: number): Promise<Department> {
    return this.updateDepartment(id, { is_active: true });
  }

  /**
   * Deactivate a department
   */
  async deactivateDepartment(id: number): Promise<Department> {
    return this.updateDepartment(id, { is_active: false });
  }

  /**
   * Get active departments only
   */
  async getActiveDepartments(params?: Omit<GetDepartmentsParams, 'is_active'>): Promise<DepartmentsResponse> {
    return this.getDepartments({ ...params, is_active: true });
  }

  /**
   * Get departments by ministry
   */
  async getDepartmentsByMinistry(ministryId: number, params?: Omit<GetDepartmentsParams, 'ministry'>): Promise<DepartmentsResponse> {
    return this.getDepartments({ ...params, ministry: ministryId });
  }
}

export const departmentService = new DepartmentService();
