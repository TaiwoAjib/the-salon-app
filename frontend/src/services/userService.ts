import { authService } from './authService';
import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'admin' | 'stylist' | 'customer';
  profileImage?: string | null;
  birthDay?: number | null;
  birthMonth?: number | null;
  notificationConsent?: boolean;
  createdAt: string;
  _count?: {
    bookings: number;
  };
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

export interface UserParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const userService = {
  async getCustomers(params?: UserParams): Promise<PaginatedResponse<User>> {
    const token = authService.getToken();
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);

    const response = await fetch(`${API_URL}/users/customers?${query.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch customers');
    return response.json();
  },

  async createCustomer(data: Partial<User> & { password?: string }): Promise<User> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/users/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create customer');
    }
    return response.json();
  },

  async updateCustomer(id: string, data: Partial<User>): Promise<User> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/users/customers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update customer');
    }
    return response.json();
  },

  async deleteCustomer(id: string): Promise<void> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/users/customers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete customer');
    }
  },

  async updateProfile(formData: FormData): Promise<User> {
    const token = authService.getToken();
    // Note: Do not set Content-Type header when sending FormData; browser sets it with boundary
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
    }
    return response.json();
  },

  async updateNotificationConsent(notificationConsent: boolean): Promise<User> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ notificationConsent })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update notification consent');
    }

    return response.json();
  }
};
