import axios from 'axios';

const api = axios.create({
  baseURL: 'http://secrets-of-the-east.ru/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: добавляет токен к каждому запросу
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;
