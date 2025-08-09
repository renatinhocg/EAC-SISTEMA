import React, { useContext, useEffect, useState } from 'react';
import { Spin, message, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import { BellOutlined } from '@ant-design/icons';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

interface Notificacao {
  id: number;
  titulo: string;
  descricao: string;
  para_todos: boolean;
  equipe_id?: number;
  data_criacao?: string; // Adicionando campo para data
}

const Notificacoes: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Notificacao[]>('/notificacoes')
      .then(res => {
        const data = res.data.filter(n =>
          n.para_todos || n.equipe_id === user?.equipe?.id
        );
        setNotificacoes(data);
      })
      .catch(() => message.error('Erro ao carregar notificações'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#141B34',
        padding: '10px 16px 90px 16px',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Spin style={{ display: 'block' }} />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#141B34',
      padding: '10px 16px 90px 16px',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header igual ao das outras páginas */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '24px' 
      }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: '600', marginTop: '10px' }}>
            Notificações
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
                  ? `http://localhost:3000/uploads/usuarios/${user.foto}?t=${Date.now()}`
                  : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
              }
              size={48}
              onClick={() => navigate('/perfil')}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Conteúdo das Notificações */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {notificacoes.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: 'rgba(255, 255, 255, 0.6)', 
            marginTop: '40px',
            fontSize: '16px'
          }}>
            Nenhuma notificação encontrada
          </div>
        ) : (
          notificacoes.map(item => {
            // Gerar data fictícia baseada no ID para demonstração
            const dataFicticia = new Date();
            dataFicticia.setDate(dataFicticia.getDate() - (item.id % 10));
            const dataFormatada = dataFicticia.toLocaleDateString('pt-BR');

            return (
              <div 
                key={item.id}
                style={{
                  background: '#0F1528',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}
              >
                {/* Ícone do sino quase apagado */}
                <div style={{
                  marginTop: '4px'
                }}>
                  <BellOutlined 
                    style={{ 
                      fontSize: '18px', 
                      color: '#273151' 
                    }} 
                  />
                </div>

                {/* Conteúdo principal */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    {/* Título */}
                    <div style={{
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      lineHeight: '1.3'
                    }}>
                      {item.titulo}
                    </div>

                    {/* Data */}
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '12px',
                      marginLeft: '12px',
                      flexShrink: 0
                    }}>
                      {item.data_criacao || dataFormatada}
                    </div>
                  </div>

                  {/* Descrição */}
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}>
                    {item.descricao}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notificacoes;
