import axios from 'axios';

// Configuração da API 
const getBaseURL = () => {
  // Se estiver em produção, usa a URL do environment ou fallback
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://eac-pwa-project-production.up.railway.app/api';
  }
  
  // Se estiver em desenvolvimento
  return 'http://localhost:3001';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para adicionar token de autenticação automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
