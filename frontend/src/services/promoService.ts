import axios from 'axios';
import { getAuthHeader } from './authService';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/promos`;

export interface MonthlyPromo {
  id: string;
  title?: string;
  promoMonth: string;
  promoYear: number;
  offerEnds: string;
  stylePricingId: string;
  stylePricing?: {
    id: string;
    price: number;
    style: { id: string; name: string };
    category: { id: string; name: string };
  };
  promoPrice: number;
  discountPercentage?: number;
  promoDuration?: number;
  description?: string;
  terms: string[];
  isActive: boolean;
  createdAt: string;
}

export const getActivePromos = async (): Promise<MonthlyPromo[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getAllPromos = async (): Promise<MonthlyPromo[]> => {
  const response = await axios.get(`${API_URL}/admin/all`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const createPromo = async (data: any): Promise<MonthlyPromo> => {
  const response = await axios.post(API_URL, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const deletePromo = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
};

export const togglePromoStatus = async (id: string): Promise<MonthlyPromo> => {
  const response = await axios.patch(`${API_URL}/${id}/status`, {}, {
    headers: getAuthHeader(),
  });
  return response.data;
};
