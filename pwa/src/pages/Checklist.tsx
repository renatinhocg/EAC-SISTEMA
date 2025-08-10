import React, { useEffect, useState, useCallback } from 'react';
import { message, Spin, Avatar, Checkbox, Tabs } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { getUserAvatarUrl } from '../utils/imageUtils';

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
  { key: 'Pré', label: 'Pré' },
  { key: 'Durante', label: 'Durante' },
  { key: 'Pós', label: 'Pós' }
];

const Checklist: React.FC = () => {
  const [itemsByTipo, setItemsByTipo] = useState<ChecklistByTipo>({});
  const [loading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const { user } = useAuth();
  const navigate = useNavigate();

  // Função para carregar checks salvos no localStorage
  const loadCheckedItems = useCallback(() => {
    try {
      const saved = localStorage.getItem(`checklist-checks-${user?.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCheckedItems(new Set(parsed));
      }
    } catch (error) {
      console.error('Erro ao carregar checks:', error);
    }
  }, [user?.id]);

  // Função para salvar checks no localStorage
  const saveCheckedItems = (newCheckedItems: Set<number>) => {
    try {
      localStorage.setItem(`checklist-checks-${user?.id}`, JSON.stringify(Array.from(newCheckedItems)));
    } catch (error) {
      console.error('Erro ao salvar checks:', error);
    }
  };

  // Função para toggle do checkbox
  const handleCheckToggle = (itemId: number) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);
    saveCheckedItems(newCheckedItems);
  };

  useEffect(() => {
    if (user?.id) {
      loadCheckedItems();
    }
    
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
  }, [user?.equipe?.id, user?.id, loadCheckedItems]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#141B34',
      padding: '10px 16px 90px 16px',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* CSS customizado para as abas */}
      <style>
        {`
          /* Container das abas */
          .ant-tabs .ant-tabs-nav {
            margin-bottom: 24px !important;
          }
          
          .ant-tabs .ant-tabs-nav-list {
            display: flex !important;
            gap: 4px !important;
            width: 100% !important;
            background: rgba(0, 0, 0, 0.2) !important;
            border-radius: 12px !important;
            padding: 4px !important;
          }
          
          /* Estilo das abas individuais */
          .ant-tabs .ant-tabs-tab {
            flex: 1 !important;
            background: transparent !important;
            color: #ffffff !important;
            font-weight: 500 !important;
            font-size: 16px !important;
            border-radius: 8px !important;
            padding: 10px 16px !important;
            margin: 0 !important;
            border: none !important;
            text-align: center !important;
            transition: all 0.2s ease !important;
          }
          
          /* Aba ativa */
          .ant-tabs .ant-tabs-tab-active {
            background: #0345EF !important;
            color: #fff !important;
          }
          
          /* Garante cor branca no texto da aba ativa */
          .ant-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #fff !important;
          }
          
          /* Remover o indicador padrão */
          .ant-tabs .ant-tabs-ink-bar {
            display: none !important;
          }
          
          /* Container do conteúdo */
          .ant-tabs .ant-tabs-content-holder {
            background: transparent !important;
          }
          
          /* Estilos dos checkboxes */
          .ant-checkbox .ant-checkbox-inner {
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(255, 255, 255, 0.3) !important;
          }
          .ant-checkbox-checked .ant-checkbox-inner {
            background: #0345EF !important;
            border-color: #0345EF !important;
          }
          
          /* Estilos para conteúdo HTML do Quill */
          .ql-align-justify {
            text-align: justify !important;
          }
          .ql-align-center {
            text-align: center !important;
          }
          .ql-align-right {
            text-align: right !important;
          }
          p {
            margin: 0 0 8px 0 !important;
          }
          strong {
            font-weight: bold !important;
          }
          em {
            font-style: italic !important;
          }
        `}
      </style>
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
          height: '200px' ,
          fontSize:'20px'
        }}>
          <Spin size="large" />
        </div>
      ) : (
        <Tabs
          defaultActiveKey="Pré"
          centered
          items={tipos.map(tipo => ({
            key: tipo.key,
            label: tipo.label,
            children: (
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                fontSize:'20px',
                gap: '8px',
                paddingTop: '16px'
              }}>
                {(() => {
                  const items = itemsByTipo[tipo.key] || [];
                  
                  if (items.length === 0) {
                    return (
                      <div style={{ 
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        padding: '40px 20px',
                        background: '#0F1528',
                        borderRadius: '12px',
                      }}>
                        Nenhum item encontrado para esta categoria
                      </div>
                    );
                  }
                  
                  return items.map(item => (
                    <div
                      key={item.id}
                      style={{
                        background: '#0F1528',
                        borderRadius: '12px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}
                    >
                      <Checkbox
                        checked={checkedItems.has(item.id)}
                        onChange={() => handleCheckToggle(item.id)}
                        style={{
                          marginTop: '2px'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: '700',
                          color: checkedItems.has(item.id) ? 'rgba(255, 255, 255, 0.6)' : '#fff',
                          marginBottom: '8px',
                          textDecoration: checkedItems.has(item.id) ? 'line-through' : 'none'
                        }}>
                          {item.titulo}
                        </div>
                        {item.descricao && (
                          <div 
                            style={{
                              fontSize: '14px',
                              color: checkedItems.has(item.id) ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.7)',
                              lineHeight: '1.4'
                            }}
                            dangerouslySetInnerHTML={{ 
                              __html: (() => {
                                console.log('Descrição original:', item.descricao);
                                let decoded = item.descricao;
                                
                                // Tentar decodificar múltiplas vezes se necessário
                                try {
                                  // Primeiro, tentar decodificar HTML entities
                                  const textarea = document.createElement('textarea');
                                  textarea.innerHTML = decoded;
                                  decoded = textarea.value;
                                  
                                  // Se ainda tem códigos HTML, decodificar manualmente
                                  decoded = decoded
                                    .replace(/&lt;/g, '<')
                                    .replace(/&gt;/g, '>')
                                    .replace(/&quot;/g, '"')
                                    .replace(/&#39;/g, "'")
                                    .replace(/&amp;/g, '&');
                                    
                                  console.log('Descrição decodificada:', decoded);
                                  return decoded;
                                } catch (e) {
                                  console.error('Erro ao decodificar:', e);
                                  return item.descricao;
                                }
                              })()
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )
          }))}
          tabBarStyle={{
            backgroundColor: 'transparent',
            marginBottom: '0',
            color: '#fff'
          }}
        />
      )}
    </div>
  );
}

export default Checklist;
