export const getMinhasCamisas = () => api.get('/camisas');
export const getMinhasReservas = () => api.get('/hamburguer/minhas');
import axios from 'axios';

// Configuração da API 

const api = axios.create({
  baseURL: window.location.hostname === "localhost"
    ? "http://localhost:3001/api"
    : "https://eac-pwa-project-production.up.railway.app/api",
  timeout: 10000 // 10 segundos de timeout
});

// Interceptor para adicionar token de autenticação automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const reservarHamburguer = async (hamburguer: number, trio: number) => {
  return api.post('/hamburguer/reservar', { hamburguer, trio });
};

export default api;
