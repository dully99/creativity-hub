import { apiClient } from "./api-client";

export interface Unit {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  ministry: number;
  ministry_name?: string;
  head_of_unit?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UnitsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Unit[];
}

export interface CreateUnitRequest {
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
  ministry: number;
  head_of_unit?: number;
}

export interface UpdateUnitRequest {
  name?: string;
  code?: string;
  description?: string;
  is_active?: boolean;
  ministry?: number;
  head_of_unit?: number;
}

export interface GetUnitsParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  ministry?: number;
  ordering?: string;
}

class UnitService {
  private endpoint = "/v1.0/units";

  async getUnits(params?: GetUnitsParams): Promise<UnitsResponse> {
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

    return apiClient.get<UnitsResponse>(url);
  }

  async getUnit(id: number): Promise<Unit> {
    return apiClient.get<Unit>(`${this.endpoint}/${id}/`);
  }

  async createUnit(data: CreateUnitRequest): Promise<Unit> {
    return apiClient.post<Unit>(`${this.endpoint}/`, data);
  }

  async updateUnit(id: number, data: UpdateUnitRequest): Promise<Unit> {
    return apiClient.patch<Unit>(`${this.endpoint}/${id}/`, data);
  }

  async deleteUnit(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}/`);
  }

  async activateUnit(id: number): Promise<Unit> {
    return this.updateUnit(id, { is_active: true });
  }

  async deactivateUnit(id: number): Promise<Unit> {
    return this.updateUnit(id, { is_active: false });
  }

  async getActiveUnits(params?: Omit<GetUnitsParams, "is_active">): Promise<UnitsResponse> {
    return this.getUnits({ ...params, is_active: true });
  }

  async getUnitsByMinistry(ministryId: number, params?: Omit<GetUnitsParams, "ministry">): Promise<UnitsResponse> {
    return this.getUnits({ ...params, ministry: ministryId });
  }
}

export const unitService = new UnitService();
