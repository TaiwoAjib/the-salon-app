import { authService } from './authService';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/styles`;

export interface Category {
  id: string;
  name: string;
}

export interface StylePricing {
  id: string;
  price: number;
  durationMinutes: number;
  categoryId: string;
  category: Category;
}

export interface Style {
  id: string;
  name: string;
  imageUrl?: string | null;
  pricing?: StylePricing[];
}

export interface StyleParams {
  page?: number;
  limit?: number;
  search?: string;
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

export const styleService = {
  async getAllStyles(params?: StyleParams): Promise<PaginatedResponse<Style>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);

    const response = await fetch(`${API_URL}?${query.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch styles');
    return response.json();
  },

  async createStyle(data: { name: string; image?: File }): Promise<Style> {
    const token = authService.getToken();
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Content-Type is not set when using FormData, browser sets it with boundary
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to create style');
    return response.json();
  },

  async updateStyle(id: string, data: { name: string; image?: File }): Promise<Style> {
    const token = authService.getToken();
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to update style');
    return response.json();
  },

  async deleteStyle(id: string): Promise<void> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete style');
  },
  
  async updateStylePricing(styleId: string, data: { categoryId: string; price: number; durationMinutes?: number }): Promise<void> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/${styleId}/pricing`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update style pricing');
  },

  async deleteStylePricing(styleId: string, categoryId: string): Promise<void> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/${styleId}/pricing/${categoryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete style pricing');
  }
};
