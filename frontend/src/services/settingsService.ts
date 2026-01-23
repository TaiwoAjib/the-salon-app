import axios from 'axios';

import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/settings`;

export interface BusinessHours {
  [key: string]: {
    start: string;
    end: string;
    isOpen: boolean;
  };
}

export interface SalonSettings {
  id: string;
  salonName: string;
  address: string;
  phone: string;
  email: string;
  depositAmount: number | string;
  notificationsEnabled: boolean;
  requireApproval?: boolean;
  showFaqSection?: boolean;
  courtesyNotice?: string;
  logoUrl?: string;
  businessHours?: BusinessHours;
  updatedAt?: string;
}

export const settingsService = {
  getSettings: async (): Promise<SalonSettings> => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getPublicSettings: async (): Promise<SalonSettings> => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  updateSettings: async (settings: Partial<SalonSettings>): Promise<SalonSettings> => {
    const token = localStorage.getItem('token');
    const response = await axios.put(API_URL, settings, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  uploadLogo: async (file: File): Promise<{ logoUrl: string }> => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('logo', file);

    const response = await axios.post(`${API_URL}/logo`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
