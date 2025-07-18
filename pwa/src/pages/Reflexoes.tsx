import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title, Text } = Typography;

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
    <div style={{ minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <Title level={2} style={{ marginBottom: 8, textAlign: 'left' }}>Reflexões</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Acompanhe e registre suas reflexões
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
                  border: index === 0 ? '2px solid #52c41a' : '1px solid #f0f0f0',
                  boxShadow: index === 0 ? '0 4px 12px rgba(82, 196, 26, 0.15)' : '0 2px 8px rgba(0,0,0,0.06)'
                }}
                bodyStyle={{ padding: 16 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Text strong style={{ fontSize: 16, color: '#262626' }}>
                      {item.agenda_titulo || item.titulo || 'Reflexão'}
                    </Text>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CalendarOutlined style={{ color: '#52c41a', fontSize: 14 }} />
                      <Text style={{ color: '#595959', fontSize: 14 }}>
                        {formatDate(item.data)}
                      </Text>
                    </div>
                  </div>
                  
                  <Button 
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/reflexoes/${item.id}`)}
                    style={{
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontWeight: 500
                    }}
                  >
                    Acessar
                  </Button>
                </div>
              </Card>
            ))}
            
            {items.length === 0 && (
              <Card style={{ textAlign: 'center', padding: 20, borderRadius: 12 }}>
                <Text type="secondary">Nenhuma reflexão disponível</Text>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reflexoes;
