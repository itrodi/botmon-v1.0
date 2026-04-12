// Centralized API configuration.
// The base URL can be overridden per environment via the VITE_API_URL env var.
// See .env.example for reference.
export const API_BASE_URL =
  (import.meta.env && import.meta.env.VITE_API_URL) || 'https://api.automation365.io';
