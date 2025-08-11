// Função para gerar URLs de imagens que funcionam tanto em desenvolvimento quanto em produção
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // Se já for uma URL completa, retorna como está
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // URL base da API - sempre usa /uploads direto (não /api/uploads)
  const baseUrl = import.meta.env.DEV 
    ? 'http://localhost:3000' 
    : '';
    
  return `${baseUrl}/${imagePath}`;
};

// Função específica para avatares de usuários
export const getUserAvatarUrl = (userPhoto?: string): string => {
  if (!userPhoto || userPhoto.trim() === '') {
    return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face';
  }
  
  // Tanto em desenvolvimento quanto em produção, usa /uploads/usuarios/
  const baseUrl = import.meta.env.DEV ? 'http://localhost:3000' : '';
  return `${baseUrl}/uploads/usuarios/${userPhoto}`;
};
