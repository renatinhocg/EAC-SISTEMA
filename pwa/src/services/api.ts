import axios from 'axios';

// Configuração da API que funciona tanto local quanto em produção
const getBaseURL = () => {
  // Se estiver em produção, usa o mesmo domínio mas com /api
  if (import.meta.env.PROD) {
    return `${window.location.origin}/api`;
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
