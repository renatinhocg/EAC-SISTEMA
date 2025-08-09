import React, { useEffect, useState } from 'react';
import { message, Spin, Avatar } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface ChecklistItem { 
  id: number; 
  titulo: string; 
  descricao: string; 
  tipo: string; 
  equipe_ids: number[];
}

type ChecklistByTipo = {
  [tipo: string]: ChecklistItem[];
};

const tipos = [
  { key: 'pré-encontro', label: 'Pré-encontro' },
  { key: 'durante o encontro', label: 'Durante o encontro' },
  { key: 'pós-encontro', label: 'Pós-encontro' }
];

const Checklist: React.FC = () => {
  const [itemsByTipo, setItemsByTipo] = useState<ChecklistByTipo>({});
  const [loading, setLoading] = useState(false);
  const [expandedTipo, setExpandedTipo] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get('/checklists')
      .then(res => {
        const agrupado: ChecklistByTipo = {};
        tipos.forEach(t => agrupado[t.key] = []);
        
        // Filtrar apenas checklists da equipe do usuário
        const checklistsFiltrados = (res.data || []).filter((item: ChecklistItem) => {
          // Se não tem equipe definida, não mostrar
          if (!user?.equipe?.id) return false;
          
          // Mostrar se a equipe do usuário está nos equipe_ids do checklist
          return item.equipe_ids.includes(user.equipe.id);
        });
        
        checklistsFiltrados.forEach((item: ChecklistItem) => {
          if (agrupado[item.tipo]) agrupado[item.tipo].push(item);
        });
        
        setItemsByTipo(agrupado);
      })
      .catch(() => message.error('Erro ao carregar checklist'))
      .finally(() => setLoading(false));
  }, [user?.equipe?.id]);

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
            Checklist
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
        <div style={{ display: 'grid', gap: '16px' }}>
          {tipos.map(tipo => {
            const isExpanded = expandedTipo === tipo.key;
            const items = itemsByTipo[tipo.key] || [];
            
            return (
              <div
                key={tipo.key}
                style={{ 
                  background: '#0F1528',
                  borderRadius: '16px',
                  padding: '20px',
                  transition: 'all 0.3s ease'
                }}
              >
                <div 
                  onClick={() => setExpandedTipo(isExpanded ? null : tipo.key)}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>
                    {tipo.label}
                  </div>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '20px',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}>
                    ›
                  </div>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  marginTop: '4px' 
                }}>
                  {items.length} itens
                </div>

                {/* Lista expandida de itens */}
                {isExpanded && (
                  <div style={{ 
                    marginTop: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {items.length === 0 ? (
                      <div style={{ 
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        padding: '20px'
                      }}>
                        Nenhum item encontrado para esta categoria
                      </div>
                    ) : (
                      items.map(item => (
                        <div
                          key={item.id}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          <div style={{
                            fontSize: '15px',
                            fontWeight: '500',
                            color: '#fff',
                            marginBottom: '8px'
                          }}>
                            {item.titulo}
                          </div>
                          {item.descricao && (
                            <div style={{
                              fontSize: '14px',
                              color: 'rgba(255, 255, 255, 0.7)',
                              lineHeight: '1.4'
                            }}>
                              {item.descricao}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Checklist;
