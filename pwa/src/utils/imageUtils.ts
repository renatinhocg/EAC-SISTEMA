// Função para gerar URLs de imagens que funcionam tanto em desenvolvimento quanto em produção
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  // Se já for uma URL completa, retorna como está
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  // URL do backend Railway
  const backendUrl = import.meta.env.DEV
    ? 'http://localhost:3001'
    : 'https://eac-pwa-project-production.up.railway.app'; // Troque pelo seu domínio Railway se necessário
  return `${backendUrl}/${imagePath}`;
};

// Função específica para avatares de usuários
export const getUserAvatarUrl = (userPhoto?: string): string => {
  // Se não houver foto, retorna sempre o mesmo placeholder padrão
  if (!userPhoto || userPhoto.trim() === '' || userPhoto === 'null' || userPhoto === 'undefined') {
    return '/default-avatar.svg';
  }
  // Se já é uma URL completa (S3), retorna direto
  if (userPhoto.startsWith('http')) {
    return userPhoto;
  }
  // Se vier só o nome do arquivo, monta a URL do S3
  return `https://eac-reflexoes.s3.amazonaws.com/usuarios/${userPhoto}`;
};
