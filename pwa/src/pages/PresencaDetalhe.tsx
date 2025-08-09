import React, { useEffect, useState } from 'react';
import { Typography, Spin, message, Avatar } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const { Title } = Typography;

interface Usuario {
  id: number;
  nome: string;
  tipo_usuario?: string;
  foto?: string;
}

interface Presenca {
  usuario_id: number;
  presente: number | null;
}

interface Evento {
  id: number;
  titulo: string;
  data: string;
  hora_inicio?: string;
  hora_fim?: string;
}

const PresencaDetalhe: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [presencas, setPresencas] = useState<{ [usuarioId: number]: number }>({});
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { eventoId } = useParams<{ eventoId: string }>();
  const { user } = useAuth();

  useEffect(() => {
    if (!eventoId || !user) return;

    setLoading(true);
    
    const loadData = async () => {
      try {
        // Primeiro, carregar dados do evento
        const eventoRes = await api.get(`/agendas/${eventoId}`);
        setEvento(eventoRes.data);
        
        let equipes = [];
        
        // Verificar o tipo de usuário para definir como buscar as equipes
        if (user.tipo_usuario === 'Coordenador' || user.tipo_usuario === 'coordenador') {
          // Para coordenadores, primeiro tentar buscar equipes que coordenam
          const equipesRes = await api.get(`/equipes?coordenador_id=${user.id}`);
          equipes = equipesRes.data || [];
          
          // Se não encontrou equipes que coordena, mas tem uma equipe atribuída, usar essa
          if (equipes.length === 0 && user.equipe && user.equipe.id) {
            equipes = [{ id: user.equipe.id }];
          }
        } else if (user.tipo_usuario === 'admin') {
          // Admin vê todas as equipes
          const equipesRes = await api.get('/equipes');
          equipes = equipesRes.data || [];
        } else {
          // Para outros usuários (integrante, etc), buscar a equipe que fazem parte
          if (user.equipe && user.equipe.id) {
            equipes = [{ id: user.equipe.id }];
          }
        }
        
        console.log('🔍 Equipes encontradas:', equipes);
        console.log('🔍 Tipo de usuário:', user.tipo_usuario);
        console.log('🔍 Equipe do usuário:', user.equipe);
        
        if (equipes.length === 0) {
          console.log('❌ Nenhuma equipe encontrada');
          setUsuarios([]);
          setPresencas({});
          setLoading(false);
          return;
        }
        
        // Carregar todos os usuários e presenças de todas as equipes
        const results = await Promise.all(
          equipes.map((equipe: { id: number }) => 
            Promise.all([
              api.get(`/equipes/${equipe.id}/usuarios`),
              api.get(`/presencas/evento/${eventoId}/equipe/${equipe.id}`)
            ])
          )
        );
        
        console.log('🔍 Resultados das Promise.all:', results.length);
        
        // Combinar usuários de todas as equipes
        const todosUsuarios: Usuario[] = [];
        const todasPresencas: Presenca[] = [];
        
        results.forEach(([usuariosRes, presencasRes], index) => {
          console.log(`🔍 Equipe ${index}: ${usuariosRes.data?.length || 0} usuários, ${presencasRes.data?.length || 0} presenças`);
          todosUsuarios.push(...(usuariosRes.data || []));
          todasPresencas.push(...(presencasRes.data || []));
        });
        
        // Remover usuários duplicados e ordenar
        const usuariosUnicos = todosUsuarios.filter((usuario, index, self) =>
          index === self.findIndex(u => u.id === usuario.id)
        );
        
        // Ordenar: coordenadores primeiro, depois por nome
        const usuariosOrdenados = usuariosUnicos.sort((a, b) => {
          // Coordenadores primeiro
          const aEhCoordenador = a.tipo_usuario === 'coordenador' || a.tipo_usuario === 'Coordenador';
          const bEhCoordenador = b.tipo_usuario === 'coordenador' || b.tipo_usuario === 'Coordenador';
          
          if (aEhCoordenador && !bEhCoordenador) return -1;
          if (!aEhCoordenador && bEhCoordenador) return 1;
          
          // Se ambos são coordenadores ou ambos não são, ordenar por nome
          return a.nome.localeCompare(b.nome);
        });
        
        setUsuarios(usuariosOrdenados);
        
        // Mapear presenças - default sempre falta (0)
        const mapPresencas: { [usuarioId: number]: number } = {};
        
        // Primeiro, definir falta (0) para todos os usuários
        usuariosOrdenados.forEach(usuario => {
          mapPresencas[usuario.id] = 0;
        });
        
        // Depois sobrescrever apenas os que têm presença registrada
        todasPresencas.forEach(p => {
          if (p.presente !== null && p.presente !== undefined) {
            mapPresencas[p.usuario_id] = Number(p.presente);
          }
        });
        
        setPresencas(mapPresencas);
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        message.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [eventoId, user]);

  const marcarPresenca = async (usuarioId: number, status: 'falta' | 'just' | 'presente') => {
    // Guardar estado anterior antes de alterar
    const statusAnterior = presencas[usuarioId] || 0;
    
    // Atualizar estado local imediatamente
    let statusNum = 0; // falta
    if (status === 'presente') statusNum = 1;
    else if (status === 'just') statusNum = 2;
    
    console.log(`🔍 Marcando presença: usuário ${usuarioId}, status "${status}" (${statusNum}), anterior: ${statusAnterior}`);
    
    setPresencas(prev => ({ ...prev, [usuarioId]: statusNum }));
    
    try {
      let equipeDoUsuario = null;
      
      // Verificar se é coordenador, admin ou membro da equipe
      if (user?.tipo_usuario === 'Coordenador' || user?.tipo_usuario === 'coordenador') {
        // Buscar equipes que o coordenador coordena
        const equipesRes = await api.get(`/equipes?coordenador_id=${user.id}`);
        const equipes = equipesRes.data || [];
        
        // Se não tem equipes que coordena, usar a própria equipe
        if (equipes.length === 0 && user.equipe && user.equipe.id) {
          equipeDoUsuario = { id: user.equipe.id };
        } else {
          // Encontrar a equipe do usuário
          for (const equipe of equipes) {
            const usuariosRes = await api.get(`/equipes/${equipe.id}/usuarios`);
            const usuariosEquipe = usuariosRes.data || [];
            if (usuariosEquipe.some((u: Usuario) => u.id === usuarioId)) {
              equipeDoUsuario = equipe;
              break;
            }
          }
        }
      } else if (user?.tipo_usuario === 'admin') {
        // Admin pode marcar presença em qualquer equipe
        const equipesRes = await api.get('/equipes');
        const equipes = equipesRes.data || [];
        
        // Encontrar a equipe do usuário
        for (const equipe of equipes) {
          const usuariosRes = await api.get(`/equipes/${equipe.id}/usuarios`);
          const usuariosEquipe = usuariosRes.data || [];
          if (usuariosEquipe.some((u: Usuario) => u.id === usuarioId)) {
            equipeDoUsuario = equipe;
            break;
          }
        }
      } else {
        // Para outros usuários, usar a própria equipe
        if (user?.equipe && user.equipe.id) {
          equipeDoUsuario = { id: user.equipe.id };
        }
      }
      
      if (equipeDoUsuario) {
        const payload = {
          status: status === 'presente' ? 'ok' : status === 'just' ? 'justificada' : 'falta'
        };
        
        console.log(`📤 Enviando para API: /presencas/evento/${eventoId}/equipe/${equipeDoUsuario.id}/usuario/${usuarioId}`, payload);
        
        await api.post(`/presencas/evento/${eventoId}/equipe/${equipeDoUsuario.id}/usuario/${usuarioId}`, payload);
        
        console.log('✅ Presença salva com sucesso!');
        message.success('Presença atualizada!');
      } else {
        console.error('❌ Equipe não encontrada para este usuário');
        message.error('Equipe não encontrada para este usuário');
        // Reverter estado em caso de erro
        console.log(`🔄 Revertendo para status anterior: ${statusAnterior}`);
        setPresencas(prev => ({ ...prev, [usuarioId]: statusAnterior }));
      }
    } catch (error: unknown) {
      console.error('❌ Erro ao salvar presença:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      message.error('Erro ao salvar presença: ' + errorMessage);
      // Reverter para o estado anterior
      console.log(`🔄 Revertendo para status anterior: ${statusAnterior}`);
      setPresencas(prev => ({ ...prev, [usuarioId]: statusAnterior }));
    }
  };

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

  const calcularProgresso = () => {
    if (usuarios.length === 0) return 0;
    
    // Calcular progresso
    const presentes = Object.values(presencas).filter(v => v === 1).length;
    const progresso = Math.round((presentes / usuarios.length) * 100);
    
    console.log(`📊 CÁLCULO DE PROGRESSO - Detalhes:`, {
      totalUsuarios: usuarios.length,
      presentes: presentes,
      progresso: progresso,
      presencasEstado: presencas
    });
    
    return progresso;
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#141B34',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#141B34',
      padding: '24px 16px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => navigate('/presenca')}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            {evento?.titulo || 'Carregando...'}
          </Title>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
            {evento && `${formatDate(evento.data)} ${formatTime(evento.hora_inicio, evento.hora_fim)}`}
          </div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div style={{

        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
      }}>
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            width: '100%',
            height: '12px',
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${calcularProgresso()}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '6px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
        <div style={{ 
          color: 'white', 
          fontSize: '18px', 
          fontWeight: 'bold',
          textAlign: 'right'
        }}>
          {calcularProgresso()}%
        </div>
      </div>

      {/* Lista de usuários */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {usuarios.map((usuario, index) => {
          const statusAtual = presencas[usuario.id] || 0;
          
          console.log(`👤 [${index}] ${usuario.nome} (ID: ${usuario.id}) - Status: ${statusAtual} (${
            statusAtual === 0 ? 'falta' : statusAtual === 1 ? 'presente' : 'justificada'
          })`);
          
          return (
            <div
              key={usuario.id}
              style={{
                background: '#0F1528',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '16px',
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '12px'
              }}>
                <Avatar
                  src={
                    usuario.foto && usuario.foto.trim() !== ''
                      ? `http://localhost:3000/uploads/usuarios/${usuario.foto}`
                      : undefined
                  }
                  size={40}
                  style={{ 
                    background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                >
                  {!usuario.foto ? usuario.nome.charAt(0).toUpperCase() : null}
                </Avatar>
                <div>
                  <div style={{ 
                    color: 'white', 
                    fontSize: '16px', 
                    fontWeight: 'bold' 
                  }}>
                    {usuario.nome}
                  </div>
                  <div style={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    fontSize: '14px' 
                  }}>
                    {usuario.tipo_usuario}
                  </div>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => {
                    console.log(`🔴 Clicou em FALTA para usuário ${usuario.id} (${usuario.nome})`);
                    marcarPresenca(usuario.id, 'falta');
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: statusAtual === 0 ? '2px solid #ff4d4f' : '1px solid rgba(255,77,79,0.3)',
                    borderRadius: '8px',
                    background: statusAtual === 0 ? '#ff4d4f' : 'rgba(255,77,79,0.1)',
                    color: statusAtual === 0 ? 'white' : '#ff4d4f',
                    fontWeight: statusAtual === 0 ? 'bold' : 'normal',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  falta
                </button>
                <button
                  onClick={() => {
                    console.log(`🟡 Clicou em JUSTIFICADA para usuário ${usuario.id} (${usuario.nome})`);
                    marcarPresenca(usuario.id, 'just');
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: statusAtual === 2 ? '2px solid #faad14' : '1px solid rgba(250,173,20,0.3)',
                    borderRadius: '8px',
                    background: statusAtual === 2 ? '#faad14' : 'rgba(250,173,20,0.1)',
                    color: statusAtual === 2 ? 'white' : '#faad14',
                    fontWeight: statusAtual === 2 ? 'bold' : 'normal',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Just
                </button>
                <button
                  onClick={() => {
                    console.log(`🟢 Clicou em PRESENTE para usuário ${usuario.id} (${usuario.nome})`);
                    marcarPresenca(usuario.id, 'presente');
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: statusAtual === 1 ? '2px solid #52c41a' : '1px solid rgba(82,196,26,0.3)',
                    borderRadius: '8px',
                    background: statusAtual === 1 ? '#52c41a' : 'rgba(82,196,26,0.1)',
                    color: statusAtual === 1 ? 'white' : '#52c41a',
                    fontWeight: statusAtual === 1 ? 'bold' : 'normal',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Presente
                </button>
              </div>
            </div>
          );
        })}
        
        {usuarios.length === 0 && !loading && (
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.8)' }}>
              Nenhum usuário encontrado
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresencaDetalhe;
