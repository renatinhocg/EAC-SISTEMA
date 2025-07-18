// Configuração da API
const API_BASE_URL = 'https://eac-pwa-project-production.up.railway.app/api';

// Função para obter a URL completa da API
const getApiUrl = (endpoint) => {
  // Remove a barra inicial se estiver presente
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export { API_BASE_URL, getApiUrl };
