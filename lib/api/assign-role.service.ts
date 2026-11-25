import { apiClient } from "./api-client";

export interface AssignRoleRequest {
  user_id: number;
  role_id: number;
}

export interface AssignRoleResponse {
  message?: string;
  user_id: number;
  role_id: number;
}

class AssignRoleService {
  private endpoint = "/v1.0/auth/assign-role";
  private removeEndpoint = "/v1.0/auth/remove-role";

  /**
   * Assign a role to a user
   */
  async assignRole(userId: number, roleId: number): Promise<AssignRoleResponse> {
    const data: AssignRoleRequest = {
      user_id: userId,
      role_id: roleId,
    };
    return apiClient.post<AssignRoleResponse>(`${this.endpoint}/`, data);
  }

  /**
   * Remove a role from a user
   */
  async removeRole(userId: number, roleId: number): Promise<AssignRoleResponse> {
    const data: AssignRoleRequest = {
      user_id: userId,
      role_id: roleId,
    };
    return apiClient.post<AssignRoleResponse>(`${this.removeEndpoint}/`, data);
  }
}

export const assignRoleService = new AssignRoleService();
