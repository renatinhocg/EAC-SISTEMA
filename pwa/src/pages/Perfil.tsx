import React, { useContext, useRef, useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { BellOutlined, CameraOutlined, LogoutOutlined } from '@ant-design/icons';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { getUserAvatarUrl } from '../utils/imageUtils';

const Perfil: React.FC = () => {
  const { user, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      message.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('foto', file);

      const response = await api.post(`/usuarios/${user?.id}/foto`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && user) {
        // Após upload, buscar usuário atualizado do backend para garantir campo foto correto
        const userResponse = await api.get(`/usuarios/${user.id}`);
        if (userResponse.data) {
          updateUser({ ...user, ...userResponse.data });
        } else {
          // fallback: atualiza só o campo foto
          updateUser({ ...user, foto: response.data.foto });
        }
        message.success('Foto atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao enviar foto:', error);
      message.error('Erro ao atualizar foto. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#141B34',
      padding: '20px 16px 90px 16px',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '40px' 
      }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: '600' }}>
            Perfil
          </div>
        </div>
        <div style={{
          background: '#ffffff',
          borderRadius: '30px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <BellOutlined 
            onClick={() => navigate('/notificacoes')}
            style={{ fontSize: '18px', color: '#2E3D63', cursor: 'pointer' }} 
          />
        </div>
      </div>

      {/* Conteúdo do Perfil */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '24px'
      }}>
        {/* Foto do Perfil */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={handlePhotoClick}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              cursor: 'pointer',
              border: '4px solid rgba(255, 255, 255, 0.1)',
              transition: 'transform 0.2s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img 
              src={getUserAvatarUrl(user?.foto)}
              alt="Foto do Perfil"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover'
              }}
              onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/default-avatar.svg'; }}
            />
            {/* Overlay para indicar que é clicável */}
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              background: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              padding: '4px',
              fontSize: '12px',
              textAlign: 'center',
              opacity: uploading ? 1 : 0,
              transition: 'opacity 0.2s ease'
            }}>
              {uploading ? 'Enviando...' : <CameraOutlined />}
            </div>
          </div>
          
          {/* Input oculto para upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Nome do Usuário */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '28px', 
            fontWeight: '600', 
            marginBottom: '8px' 
          }}>
            {user?.nome || 'Nome do Usuário'}
          </div>
       
        </div>

        {/* Card da Equipe */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          width: '100%',
          maxWidth: '300px',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '8px',
            color:'#141B34' 
          }}>
            Equipe: {user?.equipe?.nome || 'Não definida'}
          </div>
        </div>

        {/* Botão de Sair */}
        <div 
          onClick={logout}
          style={{
            background: 'rgba(220, 53, 69, 0.8)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(220, 53, 69, 0.3)',
            width: '100%',
            maxWidth: '300px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(220, 53, 69, 1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(220, 53, 69, 0.8)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <LogoutOutlined style={{ fontSize: '16px' }} />
          <span style={{ fontSize: '16px', fontWeight: '500' }}>
            Sair
          </span>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
