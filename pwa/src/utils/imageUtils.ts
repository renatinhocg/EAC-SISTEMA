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
  // Se não houver foto, retorna sempre o mesmo placeholder padrão
  if (!userPhoto || userPhoto.trim() === '' || userPhoto === 'null' || userPhoto === 'undefined') {
    return '/default-avatar.svg';
  }
  // Adiciona cache busting para evitar imagem antiga após upload
  const baseUrl = import.meta.env.DEV ? 'http://localhost:3000' : '';
  const bust = `t=${Date.now()}`;
  return `${baseUrl}/uploads/usuarios/${userPhoto}${userPhoto.includes('?') ? '&' : '?'}${bust}`;
};
