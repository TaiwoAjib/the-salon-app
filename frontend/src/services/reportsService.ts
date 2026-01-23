import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/reports`;

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export const getDashboardStats = async () => {
    const response = await axios.get(`${API_URL}/dashboard-stats`, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const getRevenueStats = async () => {
    const response = await axios.get(`${API_URL}/revenue`, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const getServiceStats = async () => {
    const response = await axios.get(`${API_URL}/services`, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const getCategoryStats = async () => {
    const response = await axios.get(`${API_URL}/categories`, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const getStylistStats = async () => {
    const response = await axios.get(`${API_URL}/stylists`, {
        headers: getAuthHeader()
    });
    return response.data;
};
