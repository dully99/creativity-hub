import { apiClient } from "./api-client";

export interface Section {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  division: number;
  division_name?: string;
  head_of_section?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SectionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Section[];
}

export interface CreateSectionRequest {
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
  division: number;
}

export interface UpdateSectionRequest {
  name?: string;
  code?: string;
  description?: string;
  is_active?: boolean;
  division?: number;
}

export interface GetSectionsParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  division?: number;
  ordering?: string;
}

class SectionService {
  private endpoint = "/v1.0/sections";

  async getSections(params?: GetSectionsParams): Promise<SectionsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.is_active !== undefined) queryParams.append("is_active", params.is_active.toString());
    if (params?.division) queryParams.append("division", params.division.toString());
    if (params?.ordering) queryParams.append("ordering", params.ordering);

    const url = queryParams.toString()
      ? `${this.endpoint}/?${queryParams.toString()}`
      : `${this.endpoint}/`;

    return apiClient.get<SectionsResponse>(url);
  }

  async getSection(id: number): Promise<Section> {
    return apiClient.get<Section>(`${this.endpoint}/${id}/`);
  }

  async createSection(data: CreateSectionRequest): Promise<Section> {
    return apiClient.post<Section>(`${this.endpoint}/`, data);
  }

  async updateSection(id: number, data: UpdateSectionRequest): Promise<Section> {
    return apiClient.patch<Section>(`${this.endpoint}/${id}/`, data);
  }

  async deleteSection(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}/`);
  }
}

export const sectionService = new SectionService();
