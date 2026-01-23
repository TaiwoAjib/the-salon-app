import { authService } from './authService';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/categories`;

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
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

export interface CategoryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async getAllAdminCategories(params?: CategoryParams): Promise<PaginatedResponse<Category>> {
    const token = authService.getToken();
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);

    const response = await fetch(`${API_URL}/admin/all?${query.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async createCategory(data: { name: string }): Promise<Category> {
    const token = authService.getToken();
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  },

  async deleteCategory(id: string): Promise<void> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete category');
  }
};
