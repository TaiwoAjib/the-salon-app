
import axios from 'axios';
import { authService } from './authService';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/gallery`;

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const galleryService = {
  getAllItems: async () => {
    const response = await axios.get(API_URL);
    return response.data as GalleryItem[];
  },

  createItem: async (formData: FormData) => {
    const token = authService.getToken();
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as GalleryItem;
  },

  updateItem: async (id: string, formData: FormData) => {
    const token = authService.getToken();
    const response = await axios.put(`${API_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as GalleryItem;
  },

  deleteItem: async (id: string) => {
    const token = authService.getToken();
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
