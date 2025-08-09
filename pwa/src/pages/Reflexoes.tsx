import React, { useEffect, useState } from 'react';
import { Button, Spin, message, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CalendarOutlined, EyeOutlined, BellOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface ReflexaoItem { 
  id: number; 
  titulo: string; 
  data: string; 
  agenda_titulo?: string; 
}

const Reflexoes: React.FC = () => {
  const [items, setItems] = useState<ReflexaoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    api.get('/reflexoes')
      .then(res => setItems(res.data))
      .catch(() => message.error('Erro ao carregar reflexões'))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data não definida';
    
    try {
      let date;
      
      if (dateString.includes('-')) {
        date = new Date(dateString + (dateString.includes('T') ? '' : 'T00:00:00'));
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      return date.toLocaleDateString('pt-BR', { 
        day: 'numeric', 
        month: 'long'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#141B34',
      padding: '10px 16px 90px 16px',
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
          <div style={{ fontSize: '24px', fontWeight: '600', marginTop: '10px' }}>
            Reflexões
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop:'16px' }}>
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
              src={
                user?.foto && user.foto.trim() !== ''
                  ? `http://localhost:3000/uploads/usuarios/${user.foto}`
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#0F1528',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                gap: '12px' 
              }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>
                    {item.agenda_titulo || item.titulo || 'Reflexão'}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                      {formatDate(item.data)}
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/reflexoes/${item.id}`)}
                  style={{
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: '500'
                  }}
                >
                  Acessar
                </Button>
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div style={{ 
              background: '#0F1528',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Nenhuma reflexão disponível
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Reflexoes;
