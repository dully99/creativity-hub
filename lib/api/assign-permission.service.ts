import { apiClient } from "./api-client";

export interface AssignPermissionRequest {
  user_id: number;
  permission_codenames: string[];
}

export interface AssignPermissionResponse {
  message?: string;
  user_id: number;
  permission_codenames: string[];
}

export interface AssignRolePermissionRequest {
  role_id: number;
  permission_codenames: string[];
}

export interface AssignRolePermissionResponse {
  message?: string;
  role_id: number;
  permission_codenames: string[];
}

export interface RemovePermissionRequest {
  user_id: number;
  permission_codenames: string[];
}

export interface RemovePermissionResponse {
  message?: string;
  user_id: number;
  permission_codenames: string[];
}

class AssignPermissionService {
  private assignEndpoint = "/v1.0/auth/assign-permission";
  private removeEndpoint = "/v1.0/auth/remove-permission";
  private assignRolePermissionEndpoint = "/v1.0/auth/assign-role-permission";

  /**
   * Assign permissions to a user
   */
  async assignPermissions(userId: number, permissionCodenames: string[]): Promise<AssignPermissionResponse> {
    const data: AssignPermissionRequest = {
      user_id: userId,
      permission_codenames: permissionCodenames,
    };
    return apiClient.post<AssignPermissionResponse>(`${this.assignEndpoint}/`, data);
  }

  /**
   * Assign permissions to a role
   */
  async assignRolePermissions(roleId: number, permissionCodenames: string[]): Promise<AssignRolePermissionResponse> {
    const data: AssignRolePermissionRequest = {
      role_id: roleId,
      permission_codenames: permissionCodenames,
    };
    return apiClient.post<AssignRolePermissionResponse>(`${this.assignRolePermissionEndpoint}/`, data);
  }

  /**
   * Remove permissions from a user
   */
  async removePermissions(userId: number, permissionCodenames: string[]): Promise<RemovePermissionResponse> {
    const data: RemovePermissionRequest = {
      user_id: userId,
      permission_codenames: permissionCodenames,
    };
    return apiClient.post<RemovePermissionResponse>(`${this.removeEndpoint}/`, data);
  }
}

export const assignPermissionService = new AssignPermissionService();
