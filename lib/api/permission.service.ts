import { apiClient } from "./api-client";

export interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type?: number;
  app_label?: string;
}

export interface PermissionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Permission[];
}

export interface RemovePermissionRequest {
  user_id: number;
  permission_codenames: string[];
}

export interface GetPermissionsParams {
  app_label?: string;
  page?: number;
  search?: string;
}

class PermissionService {
  private endpoint = "/v1.0/auth/permissions";

  /**
   * Get permissions (paginated)
   */
  async getPermissionsPaginated(params?: GetPermissionsParams): Promise<PermissionsResponse> {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", String(params.page));
      if (params?.app_label) query.set("app_label", params.app_label);
      if (params?.search) query.set("search", params.search);
      const qs = query.toString();
      const url = `${this.endpoint}/${qs ? `?${qs}` : ""}`;
      return await apiClient.get<PermissionsResponse>(url);
    } catch (error) {
      console.error("Get permissions error:", error);
      throw error;
    }
  }

  /**
   * Get all permissions (auto-paginate through all pages)
   */
  async getPermissions(params?: GetPermissionsParams): Promise<Permission[]> {
    try {
      const response = await this.getPermissionsPaginated(params);
      return response.results;
    } catch (error) {
      console.error("Get permissions error:", error);
      throw error;
    }
  }

  /**
   * Get a single permission by ID
   */
  async getPermission(id: number): Promise<Permission> {
    try {
      const response = await apiClient.get<Permission>(`${this.endpoint}/${id}/`);
      return response;
    } catch (error) {
      console.error("Get permission error:", error);
      throw error;
    }
  }

  /**
   * Remove permissions from a user
   */
  async removePermission(data: RemovePermissionRequest): Promise<void> {
    try {
      await apiClient.post("/v1.0/auth/remove-permission/", data);
    } catch (error) {
      console.error("Remove permission error:", error);
      throw error;
    }
  }

  /**
   * Get permissions filtered by app label
   */
  async getPermissionsByApp(appLabel: string): Promise<Permission[]> {
    return this.getPermissions({ app_label: appLabel });
  }
}

export const permissionService = new PermissionService();
