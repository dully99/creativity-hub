import { apiClient } from "./api-client";

export interface Division {
  id: number;
  name: string;
  code?: string;
  division_type?: "department" | "section" | "unit";
  parent?: number | null;
  parent_id?: number | null;
  parent_name?: string | null;
  is_active?: boolean;
}

export interface DivisionResponse {
  results: Division[];
  count: number;
  next?: string;
  previous?: string;
}

class DivisionService {
  private endpoint = "/v1.0/all-divisions";

  async getDivisions(): Promise<Division[]> {
    const response = await apiClient.get<any>(`${this.endpoint}/`);
    if (Array.isArray(response)) return response;
    if (response?.results && Array.isArray(response.results))
      return response.results;
    if (response?.data && Array.isArray(response.data)) return response.data;
    return [];
  }
}

export const divisionService = new DivisionService();
