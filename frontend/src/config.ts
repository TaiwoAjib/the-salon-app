// Dynamic API URL based on environment
// In development: uses Vite proxy (relative path)
// In production: uses VITE_API_URL environment variable

const envUrl = import.meta.env.VITE_API_URL;

// If VITE_API_URL is set, ensure it ends with /api (unless it already does)
// If not set, default to /api (for local development proxy)
export const API_BASE_URL = envUrl 
  ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`)
  : '/api';

export const SALON_INFO = {
  name: "Victoria Braids & Weaves",
  bookingPhone: "+1 8622157260",
  inquiryPhone: "+1 2018854565",
};

