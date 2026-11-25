import { apiClient } from "./api-client";

export interface AssignDepartmentHeadRequest {
  user_id: number;
}

export interface AssignDepartmentHeadResponse {
  message?: string;
  department_id: number;
  user_id: number;
}

class AssignDepartmentService {
  private endpoint = "/v1.0/departments";

  /**
   * Assign a user as head of a department
   */
  async assignDepartmentHead(departmentId: number, userId: number): Promise<AssignDepartmentHeadResponse> {
    const data: AssignDepartmentHeadRequest = {
      user_id: userId,
    };
    return apiClient.post<AssignDepartmentHeadResponse>(`${this.endpoint}/${departmentId}/assign-head/`, data);
  }
}

export const assignDepartmentService = new AssignDepartmentService();
