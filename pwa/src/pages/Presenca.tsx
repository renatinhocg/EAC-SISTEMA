import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const { Title } = Typography;

interface PresencaItem {
  id: number;
  titulo: string;
  data: string;
  progress: number;
  presenca_ativa?: number;
}

const Presenca: React.FC = () => {
  const [items, setItems] = useState<PresencaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get('/agendas')
      .then(res => {
        const data = res.data as Array<any>;
        // Filtra apenas eventos com presenca_ativa = 1
        const filtrados = data.filter(e => e.presenca_ativa === 1);
        setItems(filtrados.map(e => ({
          id: e.id,
          titulo: e.titulo,
          data: e.data,
          progress: e.progresso || 0,
          presenca_ativa: e.presenca_ativa
        })));
      })
      .catch(() => message.error('Erro ao carregar presença'))
      .finally(() => setLoading(false));
  }, []);

  // Função para verificar se o evento é hoje
  const isToday = (dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date();
    const event = new Date(dateStr);
    return (
      event.getDate() === today.getDate() &&
      event.getMonth() === today.getMonth() &&
      event.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Title level={2} style={{ marginBottom: 0, textAlign: 'left' }}>Presença</Title>
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 24, textAlign: 'left' }}>Veja e acompanhe sua presença nas atividades</Typography.Text>
        <Card bodyStyle={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
          {loading ? <Spin /> : (
            <List
              dataSource={items}
              renderItem={item => {
                const aguardando = !isToday(item.data);
                return (
                  <List.Item style={{ background: aguardando ? '#fff' : '#f5f6fa', borderRadius: 8, marginBottom: 8 }}>
                    <List.Item.Meta
                      title={<span style={{ fontWeight: 700 }}>{item.titulo}</span>}
                      description={item.data ? new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : ''}
                    />
                    <button
                      style={{
                        background: '#0345EF',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 18px',
                        fontWeight: 600,
                        fontSize: 15,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px #e3e8f0',
                        transition: 'background 0.2s',
                        marginLeft: 8
                      }}
                      onClick={() => navigate(`/presenca-equipe?agendaId=${item.id}`)}
                    >Lançar Presença</button>
                  </List.Item>
                );
              }}
            />
          )}
        </Card>
      </div>
    </div>
  );
}

export default Presenca;
