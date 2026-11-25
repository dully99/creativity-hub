import { apiClient } from "./api-client";

export interface AssignUnitHeadRequest {
  user_id: number;
}

export interface AssignUnitHeadResponse {
  message?: string;
  unit_id: number;
  user_id: number;
}

class AssignUnitService {
  private endpoint = "/v1.0/units";

  /**
   * Assign a user as head of a unit
   */
  async assignUnitHead(unitId: number, userId: number): Promise<AssignUnitHeadResponse> {
    const data: AssignUnitHeadRequest = {
      user_id: userId,
    };
    return apiClient.post<AssignUnitHeadResponse>(`${this.endpoint}/${unitId}/assign-head/`, data);
  }
}

export const assignUnitService = new AssignUnitService();
