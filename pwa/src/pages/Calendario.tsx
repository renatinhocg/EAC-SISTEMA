import React, { useEffect, useState } from 'react';
import { Spin, message, Avatar } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface AgendaItem { 
  id: number; 
  titulo: string; 
  data: string; 
  hora_inicio?: string; 
  hora_fim?: string; 
}

const Calendario: React.FC = () => {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get('/agendas')
      .then(res => setItems(res.data))
      .catch(() => message.error('Erro ao carregar calendário'))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data não definida';
    
    try {
      // Tenta diferentes formatos de data
      let date;
      
      if (dateString.includes('-')) {
        // Formato YYYY-MM-DD ou YYYY-MM-DD HH:mm:ss
        date = new Date(dateString + (dateString.includes('T') ? '' : 'T00:00:00'));
      } else {
        // Outros formatos
        date = new Date(dateString);
      }
      
      // Verifica se a data é válida
      if (isNaN(date.getTime())) {
        return dateString; // Retorna a string original se não conseguir formatar
      }
      
      return date.toLocaleDateString('pt-BR', { 
        day: 'numeric', 
        month: 'long'
      });
    } catch {
      return dateString; // Retorna a string original em caso de erro
    }
  };

  const formatTime = (horaInicio?: string, horaFim?: string) => {
    if (!horaInicio) return null;
    const inicio = horaInicio.slice(0, 5); // Remove segundos
    const fim = horaFim ? horaFim.slice(0, 5) : '';
    return fim ? `${inicio} - ${fim}` : inicio;
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
            Calendário
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>
                  {item.titulo}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarOutlined style={{ color: '#1890ff', fontSize: '14px' }} />
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                    {formatDate(item.data)}
                  </div>
                </div>
                
                {formatTime(item.hora_inicio, item.hora_fim) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClockCircleOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                      {formatTime(item.hora_inicio, item.hora_fim)}
                    </div>
                  </div>
                )}
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
                Nenhum evento agendado
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Calendario;
