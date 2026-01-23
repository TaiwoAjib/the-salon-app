export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'stylist' | 'customer';
  phone?: string;
  address?: string;
  profileImage?: string | null;
  birthDay?: number | null;
  birthMonth?: number | null;
  notificationConsent?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role?: 'admin' | 'stylist' | 'customer';
}

export interface LoginData {
  email: string;
  password: string;
}

import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/auth`;

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    let result;
    try {
      result = await response.json();
    } catch (error) {
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      throw new Error(result.message || 'Registration failed');
    }

    return result;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    let result;
    try {
      result = await response.json();
    } catch (error) {
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }

    return result;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  async getMe(): Promise<User> {
    const token = this.getToken();
    const response = await fetch(`${API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch user');
    }
    
    const user = await response.json();
    localStorage.setItem('user', JSON.stringify(user)); // Update stored user
    return user;
  }
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
