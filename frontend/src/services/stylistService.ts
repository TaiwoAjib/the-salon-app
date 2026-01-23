import { authService } from "./authService";
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/stylists`;

export interface Stylist {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  skillLevel: string;
  isActive: boolean;
  createdAt: string;
  pricing?: StylistPricing[];
}

export interface StylistPricing {
  id: string;
  stylistId: string;
  categoryId: string;
  serviceId: string;
  price: number;
  durationMinutes: number;
  category?: { id: string; name: string };
  service?: { id: string; name: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StylistParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const stylistService = {
  async getAllStylists(params?: StylistParams): Promise<PaginatedResponse<Stylist>> {
    const token = authService.getToken();
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);

    const response = await fetch(`${API_URL}?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch stylists");
    return response.json();
  },

  async createStylist(data: any): Promise<Stylist> {
    const token = authService.getToken();
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create stylist");
    }
    return response.json();
  },

  async updateStylist(id: string, data: any): Promise<void> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update stylist");
  },

  async deleteStylist(id: string): Promise<void> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to delete stylist");
  },

  async getStylistById(id: string): Promise<Stylist> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch stylist details");
    return response.json();
  }
};
