
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://secrets-of-the-east.ru/api',  // базовый URL для запросов
  headers: {
    'Content-Type': 'application/json',
    // 'Authorization': 'Bearer ТВОЙ_ТОКЕН' (если авторизация требуется)
  }
});
api.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('auth_token')}`;

export default api;

