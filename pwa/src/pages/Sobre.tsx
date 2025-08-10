import React, { useContext, useEffect, useState } from 'react';
import { Spin, message, Avatar } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { getUserAvatarUrl } from '../utils/imageUtils';

const Sobre: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [teamInfo, setTeamInfo] = useState<{ nome: string; sobre: string; funcao: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.equipe?.id) {
      setLoading(true);
      api.get(`/equipes/${user.equipe.id}`)
        .then(res => setTeamInfo({ nome: res.data.nome, sobre: res.data.sobre, funcao: res.data.funcao }))
        .catch(() => message.error('Erro ao carregar informações da equipe'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user?.equipe) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#141B34',
        padding: '20px 16px 90px 16px',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: '#0F1528',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Você não está associado a nenhuma equipe.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#141B34',
      padding: '20px 16px 90px 16px',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header igual ao da Home */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '24px' 
      }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: '600' }}>
            Sobre {teamInfo?.nome || 'Equipe'}
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '4px' }}>
            {teamInfo?.funcao || 'Informações da sua equipe'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '40px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <BellOutlined 
              onClick={() => navigate('/notificacoes')}
              style={{ fontSize: '24px', color: '#2E3D63', padding:'0 16px', cursor: 'pointer' }} 
            />
            <Avatar
              src={user?.foto && user.foto.trim() !== '' 
                ? getUserAvatarUrl(user.foto)
                : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
              }
              size={48}
              onClick={() => navigate('/perfil')}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px' 
        }}>
          <Spin size="large" />
        </div>
      ) : (
        <div style={{
          background: '#0F1528',
          borderRadius: '16px',
          padding: '24px',
        }}>
          <div
            style={{ 
              whiteSpace: 'pre-wrap', 
              textAlign: 'left', 
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#fff'
            }}
            dangerouslySetInnerHTML={{ __html: teamInfo?.sobre || 'Nenhuma informação disponível sobre esta equipe.' }}
          />
        </div>
      )}
    </div>
  );
};

export default Sobre;
