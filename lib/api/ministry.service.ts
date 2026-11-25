import { apiClient } from "./api-client";

export interface Ministry {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MinistriesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Ministry[];
}

export interface CreateMinistryRequest {
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateMinistryRequest {
  name?: string;
  code?: string;
  description?: string;
  is_active?: boolean;
}

export interface GetMinistriesParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  ordering?: string;
}

class MinistryService {
  private endpoint = "/v1.0/ministry";

  /**
   * Get all ministries with optional filters
   */
  async getMinistries(params?: GetMinistriesParams): Promise<MinistriesResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.is_active !== undefined) queryParams.append("is_active", params.is_active.toString());
      if (params?.ordering) queryParams.append("ordering", params.ordering);

      const url = queryParams.toString() 
        ? `${this.endpoint}/?${queryParams.toString()}`
        : `${this.endpoint}/`;

      return await apiClient.get<MinistriesResponse>(url);
    } catch (error) {
      console.error("Error fetching ministries:", error);
      throw error;
    }
  }

  /**
   * Get a single ministry by ID
   */
  async getMinistry(id: number): Promise<Ministry> {
    try {
      return await apiClient.get<Ministry>(`${this.endpoint}/${id}/`);
    } catch (error) {
      console.error(`Error fetching ministry ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new ministry
   */
  async createMinistry(data: CreateMinistryRequest): Promise<Ministry> {
    try {
      return await apiClient.post<Ministry>(`${this.endpoint}/`, data);
    } catch (error) {
      console.error("Error creating ministry:", error);
      throw error;
    }
  }

  /**
   * Update a ministry (partial update)
   */
  async updateMinistry(id: number, data: UpdateMinistryRequest): Promise<Ministry> {
    try {
      return await apiClient.patch<Ministry>(`${this.endpoint}/${id}/`, data);
    } catch (error) {
      console.error(`Error updating ministry ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a ministry
   */
  async deleteMinistry(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}/`);
    } catch (error) {
      console.error(`Error deleting ministry ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activate a ministry
   */
  async activateMinistry(id: number): Promise<Ministry> {
    return this.updateMinistry(id, { is_active: true });
  }

  /**
   * Deactivate a ministry
   */
  async deactivateMinistry(id: number): Promise<Ministry> {
    return this.updateMinistry(id, { is_active: false });
  }

  /**
   * Get active ministries only
   */
  async getActiveMinistries(params?: Omit<GetMinistriesParams, 'is_active'>): Promise<MinistriesResponse> {
    return this.getMinistries({ ...params, is_active: true });
  }
}

export const ministryService = new MinistryService();
