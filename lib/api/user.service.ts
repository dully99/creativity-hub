import { apiClient } from "./api-client";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  is_active?: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_verified?: boolean;
  date_joined?: string;
  last_login?: string;
  phone_number?: string;
  profile_picture?: string;
  gender?: "M" | "F" | "O";
  national_id_number?: string;
  date_of_birth?: string;
  nationality?: string;
  job_title?: string;
  ministry?: number;
  ministry_name?: string;
  division?: number;
  division_name?: string;
  position?: number;
  position_name?: string;
  roles?: string[];
  permissions?: string[];
  temporary_password?: string;
  password_email_sent?: boolean;
  invite_expires_hours?: number;
  default_password_set?: boolean;
}

export interface UsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface CreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  gender?: "M" | "F" | "O";
  job_title?: string;
  division?: number | null;
  role_id?: number;
}

export interface UpdateUserRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  gender?: "M" | "F" | "O";
  job_title?: string;
  division?: number | null;
  is_active?: boolean;
  roles?: string[];
  permissions?: string[];
}

export interface GetUsersParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  ordering?: string;
}

class UserService {
  private baseUrl = "/v1.0/auth/users";

  /**
   * Get all users with optional filtering and pagination
   */
  async getUsers(params?: GetUsersParams): Promise<UsersResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.is_active !== undefined) queryParams.append("is_active", params.is_active.toString());
    if (params?.is_staff !== undefined) queryParams.append("is_staff", params.is_staff.toString());
    if (params?.is_superuser !== undefined) queryParams.append("is_superuser", params.is_superuser.toString());
    if (params?.ordering) queryParams.append("ordering", params.ordering);

    const url = queryParams.toString() 
      ? `${this.baseUrl}/?${queryParams.toString()}`
      : `${this.baseUrl}/`;

    return apiClient.get<UsersResponse>(url);
  }

  /**
   * Get a single user by ID
   */
  async getUser(id: number): Promise<User> {
    return apiClient.get<User>(`${this.baseUrl}/${id}/`);
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<User | { data?: User; success?: boolean }>(
      `${this.baseUrl}/`,
      data
    );
    if (response && typeof response === "object" && "data" in response && response.data) {
      return response.data;
    }
    return response as User;
  }

  /**
   * Update an existing user
   */
  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    return apiClient.put<User>(`${this.baseUrl}/${id}/`, data);
  }

  /**
   * Partially update a user
   */
  async patchUser(id: number, data: Partial<UpdateUserRequest>): Promise<User> {
    return apiClient.patch<User>(`${this.baseUrl}/${id}/`, data);
  }

  /**
   * Delete a user
   */
  async deleteUser(id: number): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}/`);
  }

  /**
   * Admin: reset another user's password
   */
  async resetUserPassword(
    id: number,
    data: { new_password: string; confirm_password: string }
  ): Promise<{ user_id: number; email: string; password_reset_required: boolean }> {
    const response = await apiClient.post<
      | { data?: { user_id: number; email: string; password_reset_required: boolean } }
      | { user_id: number; email: string; password_reset_required: boolean }
    >(`${this.baseUrl}/${id}/reset-password/`, data);
    if (response && typeof response === "object" && "data" in response && response.data) {
      return response.data;
    }
    return response as { user_id: number; email: string; password_reset_required: boolean };
  }

  /**
   * Activate a user
   */
  async activateUser(id: number): Promise<User> {
    return this.patchUser(id, { is_active: true });
  }

  /**
   * Deactivate a user
   */
  async deactivateUser(id: number): Promise<User> {
    return this.patchUser(id, { is_active: false });
  }

  /**
   * Assign roles to a user (deprecated - use assignRoleService instead)
   */
  async assignRoles(id: number, roleNames: string[]): Promise<User> {
    return this.patchUser(id, { roles: roleNames });
  }

  /**
   * Assign permissions to a user
   */
  async assignPermissions(id: number, permissionNames: string[]): Promise<User> {
    return this.patchUser(id, { permissions: permissionNames });
  }

  /**
   * Get active users only
   */
  async getActiveUsers(params?: Omit<GetUsersParams, 'is_active'>): Promise<UsersResponse> {
    return this.getUsers({ ...params, is_active: true });
  }

  /**
   * Get staff users only
   */
  async getStaffUsers(params?: Omit<GetUsersParams, 'is_staff'>): Promise<UsersResponse> {
    return this.getUsers({ ...params, is_staff: true });
  }

  /**
   * Get superuser users only
   */
  async getSuperUsers(params?: Omit<GetUsersParams, 'is_superuser'>): Promise<UsersResponse> {
    return this.getUsers({ ...params, is_superuser: true });
  }
}

export const userService = new UserService();
