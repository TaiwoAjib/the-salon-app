import axios from 'axios';
import { getAuthHeader } from './authService';
import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

export interface Faq {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const faqService = {
  getPublicFaqs: async () => {
    const response = await axios.get<Faq[]>(`${API_URL}/faqs/public`);
    return response.data;
  },

  getAllFaqs: async () => {
    const response = await axios.get<Faq[]>(`${API_URL}/faqs`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  createFaq: async (data: Partial<Faq>) => {
    const response = await axios.post<Faq>(`${API_URL}/faqs`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  updateFaq: async (id: string, data: Partial<Faq>) => {
    const response = await axios.put<Faq>(`${API_URL}/faqs/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  deleteFaq: async (id: string) => {
    const response = await axios.delete(`${API_URL}/faqs/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  reorderFaqs: async (orderedIds: string[]) => {
    const response = await axios.put(`${API_URL}/faqs/reorder`, { orderedIds }, {
      headers: getAuthHeader(),
    });
    return response.data;
  }
};
