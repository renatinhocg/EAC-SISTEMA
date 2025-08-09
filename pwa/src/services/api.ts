import axios from 'axios';

// Configuração da API 
const getBaseURL = () => {
  // Usa API local em desenvolvimento
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api';
  }
  // Railway em produção
  return 'https://eac-pwa-project-production.up.railway.app/api';
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
