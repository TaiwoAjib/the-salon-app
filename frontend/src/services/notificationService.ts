import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/notification-settings`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'EMAIL' | 'SMS';
  subject?: string;
  content: string;
  variables: string[] | any; // Prisma Json type can be tricky
  isActive: boolean;
}

export interface Notification {
  id: string;
  type: 'EMAIL' | 'SMS';
  recipient: string;
  subject?: string;
  content: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'WAITING_APPROVAL' | 'REJECTED';
  createdAt: string;
  sentAt?: string;
}

export const getTemplates = async () => {
  const response = await axios.get<NotificationTemplate[]>(`${API_URL}/templates`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const updateTemplate = async (id: string, data: Partial<NotificationTemplate>) => {
  const response = await axios.put<NotificationTemplate>(`${API_URL}/templates/${id}`, data, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getNotificationHistory = async () => {
  const response = await axios.get<Notification[]>(`${API_URL}/history`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getPendingApprovals = async () => {
  const response = await axios.get<Notification[]>(`${API_URL}/pending`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const approveNotification = async (id: string) => {
  const response = await axios.post<Notification>(`${API_URL}/pending/${id}/approve`, {}, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const rejectNotification = async (id: string) => {
  const response = await axios.post<Notification>(`${API_URL}/pending/${id}/reject`, {}, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const updatePendingNotification = async (id: string, data: { subject?: string, content: string }) => {
  const response = await axios.put<Notification>(`${API_URL}/pending/${id}`, data, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getMyNotifications = async () => {
  const response = await axios.get<Notification[]>(`${API_BASE_URL}/notifications/my-notifications`, {
    headers: getAuthHeader()
  });
  return response.data;
};
