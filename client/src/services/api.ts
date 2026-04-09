import axios, { type AxiosError } from 'axios';

const http = axios.create({
  baseURL: '/api',
  timeout: 120000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiMessage(err: unknown): string {
  const e = err as AxiosError<{ message?: string; detail?: string }>;
  return e.response?.data?.message || e.response?.data?.detail || e.message || '请求失败';
}

export default http;
