import { authService } from './authService';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/booking-policy`;

export interface BookingPolicy {
  id: string;
  content: string;
  isActive: boolean;
  updatedAt: string;
}

export const bookingPolicyService = {
  async getPolicy(): Promise<BookingPolicy | null> {
    const response = await fetch(API_URL);
    if (!response.ok) {
        // If 404 or empty, return null
        if (response.status === 404) return null;
        throw new Error('Failed to fetch booking policy');
    }
    return response.json();
  },

  async updatePolicy(content: string): Promise<BookingPolicy> {
    const token = authService.getToken();
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Failed to update booking policy');
    return response.json();
  },
};
