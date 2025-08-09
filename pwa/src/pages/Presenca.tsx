import React, { useEffect, useState } from 'react';
import { Spin, message, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BellOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface PresencaItem {
  id: number;
  titulo: string;
  data: string;
  hora_inicio?: string;
  hora_fim?: string;
  progresso: number;
  presenca_ativa?: number;
}

interface AgendaItem {
  id: number;
  titulo: string;
  data: string;
  hora_inicio?: string;
  hora_fim?: string;
  presenca_ativa: number | boolean;
}

interface PresencaRecord {
  presente: number;
}

const Presenca: React.FC = () => {
  const [items, setItems] = useState<PresencaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    
    const loadData = async () => {
      try {
        // Buscar eventos e equipes
        const [agendasRes, equipesRes] = await Promise.all([
          api.get('/agendas'),
          user && (user.tipo_usuario === 'Coordenador' || user.tipo_usuario === 'coordenador')
            ? api.get(`/equipes?coordenador_id=${user.id}`).then(res => {
                // Se coordenador não tem equipes que coordena, mas tem equipe atribuída, usar essa
                if ((!res.data || res.data.length === 0) && user.equipe && user.equipe.id) {
                  return Promise.resolve({ data: [{ id: user.equipe.id }] });
                }
                return res;
              })
            : user && user.equipe && user.equipe.id
            ? Promise.resolve({ data: [{ id: user.equipe.id }] })
            : user && user.tipo_usuario === 'admin'
            ? api.get('/equipes') // Admin vê todas as equipes
            : Promise.resolve({ data: [] })
        ]);
        
        const agendas = agendasRes.data;
        const equipes = equipesRes.data;
        
        // Filtra apenas eventos com presenca_ativa = 1
        const filtrados = agendas.filter((e: AgendaItem) => e.presenca_ativa === 1 || e.presenca_ativa === true);
        
        // Para cada agenda, calcular o progresso de presença
        const itemsComProgresso = await Promise.all(filtrados.map(async (agenda: AgendaItem) => {
          try {
            let totalUsuarios = 0;
            let totalPresentes = 0;
            
            // Calcular presença para todas as equipes
            for (const equipe of equipes) {
              try {
                const [usuariosRes, presencasRes] = await Promise.all([
                  api.get(`/equipes/${equipe.id}/usuarios`),
                  api.get(`/presencas/evento/${agenda.id}/equipe/${equipe.id}`)
                ]);
                
                const usuarios = usuariosRes.data || [];
                const presencas = presencasRes.data || [];
                
                totalUsuarios += usuarios.length;
                totalPresentes += presencas.filter((p: PresencaRecord) => p.presente === 1).length;
              } catch (err) {
                console.log('Erro ao calcular presença:', err);
              }
            }
            
            const progresso = totalUsuarios > 0 ? Math.round((totalPresentes / totalUsuarios) * 100) : 0;
            
            console.log(`📊 CÁLCULO DE PROGRESSO - Lista (${agenda.titulo}):`, {
              totalUsuarios: totalUsuarios,
              totalPresentes: totalPresentes,
              progresso: progresso,
              equipesConsideradas: equipes.length
            });
            
            return {
              id: agenda.id,
              titulo: agenda.titulo,
              data: agenda.data,
              hora_inicio: agenda.hora_inicio,
              hora_fim: agenda.hora_fim,
              progresso,
              presenca_ativa: agenda.presenca_ativa
            };
          } catch (err) {
            console.log('Erro ao processar agenda:', err);
            return {
              id: agenda.id,
              titulo: agenda.titulo,
              data: agenda.data,
              hora_inicio: agenda.hora_inicio,
              hora_fim: agenda.hora_fim,
              progresso: 0,
              presenca_ativa: agenda.presenca_ativa
            };
          }
        }));
        
        setItems(itemsComProgresso);
      } catch (error) {
        console.error('Erro ao carregar presença:', error);
        message.error('Erro ao carregar presença');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (horaInicio?: string, horaFim?: string) => {
    if (!horaInicio) return '';
    const inicio = horaInicio.slice(0, 5);
    const fim = horaFim ? ` - ${horaFim.slice(0, 5)}` : '';
    return `${inicio}${fim}`;
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
          <div style={{ fontSize: '24px', fontWeight: '600' , marginTop: '10px' }}>
            Presença
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
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px'
        }}>
          {items.map(item => (
            <div
              key={item.id}
              style={{
                background: '#0F1528',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onClick={() => navigate(`/presenca-detalhe/${item.id}`)}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    color: '#fff', 
                    fontSize: '18px', 
                    fontWeight: '600',
                    marginBottom: '4px',
                    lineHeight: 1.3
                  }}>
                    {item.titulo}
                  </div>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    fontSize: '14px',
                    lineHeight: 1.4
                  }}>
                    {formatDate(item.data)} {formatTime(item.hora_inicio, item.hora_fim)}
                  </div>
                </div>
                <ArrowRight size={20} color="rgba(255, 255, 255, 0.7)" />
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${item.progresso}%`,
                    height: '100%',
                    background: item.progresso > 0 ? 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)' : 'rgba(255,255,255,0.2)',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
              
              <div style={{ 
                color: '#fff', 
                fontSize: '16px', 
                fontWeight: '600',
                textAlign: 'right'
              }}>
                {item.progresso}%
              </div>
            </div>
          ))}
          
          {items.length === 0 && !loading && (
            <div style={{
              background: '#0F1528',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Nenhum evento com presença ativa encontrado
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Presenca;
