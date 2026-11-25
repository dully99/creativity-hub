import { apiClient } from "./api-client";

export interface Role {
  id: number;
  name: string;
}

export interface RolesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Role[];
}

export interface CreateRoleRequest {
  name: string;
}

export interface UpdateRoleRequest {
  name: string;
}

class RoleService {
  private endpoint = "/v1.0/auth/roles";

  /**
   * Get all roles
   */
  async getRolesPaginated(page = 1, search = ""): Promise<RolesResponse> {
    const params = new URLSearchParams({ page: String(page) });
    if (search.trim()) params.set("search", search.trim());
    return apiClient.get<RolesResponse>(`${this.endpoint}/?${params.toString()}`);
  }

  async getRoles(): Promise<Role[]> {
    try {
      const response = await apiClient.get<RolesResponse | Role[] | { data?: Role[] | RolesResponse }>(
        `${this.endpoint}/?page_size=100`
      );
      if (Array.isArray(response)) return response;
      if (response && typeof response === "object") {
        const obj = response as Record<string, unknown>;
        if (Array.isArray(obj.results)) return obj.results as Role[];
        if (Array.isArray(obj.data)) return obj.data as Role[];
        const nested = obj.data;
        if (nested && typeof nested === "object" && Array.isArray((nested as RolesResponse).results)) {
          return (nested as RolesResponse).results;
        }
      }
      return [];
    } catch (error) {
      console.error("Get roles error:", error);
      throw error;
    }
  }

  /**
   * Get a single role by ID
   */
  async getRole(id: number): Promise<Role> {
    try {
      const response = await apiClient.get<Role>(`${this.endpoint}/${id}/`);
      return response;
    } catch (error) {
      console.error("Get role error:", error);
      throw error;
    }
  }

  /**
   * Create a new role
   */
  async createRole(data: CreateRoleRequest): Promise<Role> {
    try {
      const response = await apiClient.post<Role>(`${this.endpoint}/`, data);
      return response;
    } catch (error) {
      console.error("Create role error:", error);
      throw error;
    }
  }

  /**
   * Update an existing role
   */
  async updateRole(id: number, data: UpdateRoleRequest): Promise<Role> {
    try {
      const response = await apiClient.put<Role>(`${this.endpoint}/${id}/`, data);
      return response;
    } catch (error) {
      console.error("Update role error:", error);
      throw error;
    }
  }

  /**
   * Get permissions assigned to a role
   */
  async getRolePermissions(roleId: number): Promise<string[]> {
    try {
      const response = await apiClient.get<unknown>(`/v1.0/auth/role-permissions/${roleId}/`);
      const extractCodenames = (arr: unknown[]): string[] =>
        arr.map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") {
            const o = item as Record<string, unknown>;
            return (o.codename ?? o.name ?? o.permission_codename ?? String(item)) as string;
          }
          return String(item);
        });
      if (Array.isArray(response)) return extractCodenames(response);
      const obj = response as Record<string, unknown>;
      if (Array.isArray(obj.permissions)) return extractCodenames(obj.permissions);
      if (Array.isArray(obj.permission_codenames)) return extractCodenames(obj.permission_codenames);
      if (Array.isArray(obj.results)) return extractCodenames(obj.results);
      return [];
    } catch (error) {
      console.error("Get role permissions error:", error);
      throw error;
    }
  }

  /**
   * Delete a role
   */
  async deleteRole(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}/`);
    } catch (error) {
      console.error("Delete role error:", error);
      throw error;
    }
  }
}

export const roleService = new RoleService();
