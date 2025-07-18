import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, message } from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title, Text } = Typography;

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
    <div style={{ minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <Title level={2} style={{ marginBottom: 8, textAlign: 'left' }}>Calendário</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Veja os próximos eventos e compromissos
        </Text>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {items.map((item, index) => (
              <Card
                key={item.id}
                style={{
                  borderRadius: 12,
                  border: index === 0 ? '2px solid #1890ff' : '1px solid #f0f0f0',
                  boxShadow: index === 0 ? '0 4px 12px rgba(24, 144, 255, 0.15)' : '0 2px 8px rgba(0,0,0,0.06)'
                }}
                bodyStyle={{ padding: 16 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Text strong style={{ fontSize: 16, color: '#262626' }}>
                    {item.titulo}
                  </Text>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalendarOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                    <Text style={{ color: '#595959', fontSize: 14 }}>
                      {formatDate(item.data)}
                    </Text>
                  </div>
                  
                  {formatTime(item.hora_inicio, item.hora_fim) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ClockCircleOutlined style={{ color: '#52c41a', fontSize: 14 }} />
                      <Text style={{ color: '#595959', fontSize: 14 }}>
                        {formatTime(item.hora_inicio, item.hora_fim)}
                      </Text>
                    </div>
                  )}
                </div>
              </Card>
            ))}
            
            {items.length === 0 && (
              <Card style={{ textAlign: 'center', padding: 20, borderRadius: 12 }}>
                <Text type="secondary">Nenhum evento agendado</Text>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Calendario;
