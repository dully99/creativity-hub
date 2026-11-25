import { apiClient } from "./api-client";

export interface PlanBudgetType {
  id: number;
  type: string;
  description: string | null;
  type_display?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PlanBudgetTypeRequest {
  type: string;
  description?: string;
}

export interface PlanBudgetTypeResponse {
  results: PlanBudgetType[];
  count: number;
  next?: string;
  previous?: string;
}

function extractPlanBudgetTypes(
  response: PlanBudgetTypeResponse | PlanBudgetType[] | { data?: PlanBudgetTypeResponse | PlanBudgetType[] }
): PlanBudgetType[] {
  if (Array.isArray(response)) return response;
  if (response && typeof response === "object" && "results" in response && Array.isArray(response.results)) {
    return response.results;
  }
  if (response && typeof response === "object" && "data" in response && response.data) {
    return extractPlanBudgetTypes(response.data);
  }
  return [];
}

/** Label for dropdowns: prefer description from Plan Budget Types page. */
export function planBudgetTypeLabel(item: PlanBudgetType): string {
  const description = item.description?.trim();
  if (description) return description;
  if (item.type_display) return item.type_display;
  return item.type.charAt(0).toUpperCase() + item.type.slice(1);
}

class PlanBudgetTypeService {
  private endpoint = "/v1.0/planning/plan-budget-types";

  async getPlanBudgetTypesPaginated(page = 1, search = ""): Promise<PlanBudgetTypeResponse> {
    const params = new URLSearchParams({ page: String(page) });
    if (search.trim()) params.set("search", search.trim());
    return apiClient.get<PlanBudgetTypeResponse>(`${this.endpoint}/?${params.toString()}`);
  }

  async getPlanBudgetTypes(): Promise<PlanBudgetTypeResponse> {
    const response = await apiClient.get<PlanBudgetTypeResponse>(
      `${this.endpoint}/?page_size=100`
    );
    const results = extractPlanBudgetTypes(response);
    return {
      results,
      count: "count" in response && typeof response.count === "number" ? response.count : results.length,
      next: "next" in response ? response.next : undefined,
      previous: "previous" in response ? response.previous : undefined,
    };
  }

  /** Flat list for form dropdowns. */
  async listPlanBudgetTypes(): Promise<PlanBudgetType[]> {
    const response = await this.getPlanBudgetTypes();
    return response.results;
  }

  async getPlanBudgetType(id: number): Promise<PlanBudgetType> {
    return apiClient.get<PlanBudgetType>(`${this.endpoint}/${id}/`);
  }

  async createPlanBudgetType(data: PlanBudgetTypeRequest): Promise<PlanBudgetType> {
    return apiClient.post<PlanBudgetType>(`${this.endpoint}/`, data);
  }

  async updatePlanBudgetType(id: number, data: Partial<PlanBudgetTypeRequest>): Promise<PlanBudgetType> {
    return apiClient.patch<PlanBudgetType>(`${this.endpoint}/${id}/`, data);
  }

  async deletePlanBudgetType(id: number): Promise<void> {
    await apiClient.delete<void>(`${this.endpoint}/${id}/`);
  }
}

export const planBudgetTypeService = new PlanBudgetTypeService();
