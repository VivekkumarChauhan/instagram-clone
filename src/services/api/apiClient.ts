import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, clearTokens } from '@utils/tokenStorage';
import { API_BASE_URL } from '@utils/constants';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearTokens();
    }
    return Promise.reject(normalizeError(error));
  },
);

function normalizeError(error: AxiosError): Error {
  if (error.response?.data && typeof error.response.data === 'object') {
    const data = error.response.data as Record<string, unknown>;
    const message = typeof data.message === 'string' ? data.message : 'An error occurred';
    return new Error(message);
  }
  if (error.code === 'ECONNABORTED') return new Error('Request timed out');
  if (!error.response) return new Error('Network error. Please check your connection.');
  return new Error(error.message || 'An unexpected error occurred');
}

export default apiClient;
