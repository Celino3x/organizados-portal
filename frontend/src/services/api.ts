import axios from 'axios';

// FORÇAR a URL do backend no Render - URL COMPLETA COM HTTPS
const API_URL = 'https://organizados-portal.onrender.com/api';

console.log('🔗 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 Requisição: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => {
    console.log(`📥 Resposta: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Erro na resposta:', error.response?.status, error.config?.url);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);

export default api;