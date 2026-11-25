import { apiClient } from "./api-client";

export interface Position {
  id: number;
  name: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

export interface PositionRequest {
  name: string;
  description?: string;
}

export interface PositionResponse {
  results: Position[];
  count: number;
  next?: string;
  previous?: string;
}

class PositionService {
  private endpoint = "/v1.0/auth/positions";

  async getPositionsPaginated(page = 1, search = ""): Promise<PositionResponse> {
    const params = new URLSearchParams({ page: String(page) });
    if (search.trim()) params.set("search", search.trim());
    return apiClient.get<PositionResponse>(`${this.endpoint}/?${params.toString()}`);
  }

  async getPositions(): Promise<PositionResponse> {
    return apiClient.get<PositionResponse>(`${this.endpoint}/`);
  }

  async getPosition(id: number): Promise<Position> {
    return apiClient.get<Position>(`${this.endpoint}/${id}/`);
  }

  async createPosition(data: PositionRequest): Promise<Position> {
    return apiClient.post<Position>(`${this.endpoint}/`, data);
  }

  async updatePosition(id: number, data: Partial<PositionRequest>): Promise<Position> {
    return apiClient.patch<Position>(`${this.endpoint}/${id}/`, data);
  }

  async deletePosition(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}/`);
  }
}

export const positionService = new PositionService();
