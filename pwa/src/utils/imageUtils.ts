// Função para gerar URLs de imagens que funcionam tanto em desenvolvimento quanto em produção
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // Se já for uma URL completa, retorna como está
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // URL base da API (com /api para uploads também)
  const baseUrl = import.meta.env.DEV 
    ? 'http://localhost:3000/api' 
    : 'https://eac-pwa-project-production.up.railway.app/api';
    
  return `${baseUrl}/${imagePath}`;
};

// Função específica para avatares de usuários
export const getUserAvatarUrl = (userPhoto?: string): string => {
  if (!userPhoto || userPhoto.trim() === '') {
    return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face';
  }
  
  // Em desenvolvimento, usa a API do backend
  if (import.meta.env.DEV) {
    return `http://localhost:3000/api/uploads/usuarios/${userPhoto}`;
  }
  
  // Em produção, usa as imagens da pasta public (servidas pelo frontend)
  return `/uploads/usuarios/${userPhoto}`;
};
