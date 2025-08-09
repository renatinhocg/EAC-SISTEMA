import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Drawer, Spin, Select, Button, message } from 'antd';
import { getApiUrl } from '../config/api';

const STATUS_OPTIONS = [
  { value: 1, label: 'Presente' },
  { value: 0, label: 'Falta' },
  { value: 2, label: 'Justificada' },
];

// Página zerada para recomeçar do zero
const AgendaPresencaEquipes = () => {
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [drawerEquipe, setDrawerEquipe] = useState(null); // equipe selecionada
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [presencasEdit, setPresencasEdit] = useState({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { agendaId } = useParams();

  // Função para buscar equipes e atualizar porcentagem de presença
  const fetchEquipes = async () => {
    setLoading(true);
    setErro('');
    try {
      const res = await axios.get(getApiUrl('equipes'));
      if (!Array.isArray(res.data) || res.data.length === 0) {
        setEquipes([]);
        setErro('Nenhuma equipe encontrada.');
        return;
      }
      const equipesComPresenca = await Promise.all(res.data.map(async eq => {
        try {
          const usuariosRes = await axios.get(getApiUrl(`equipes/${eq.id}/usuarios`));
          const total = usuariosRes.data.length;
          const presencasRes = await axios.get(getApiUrl(`presencas/evento/${agendaId}/equipe/${eq.id}`));
          const presentes = presencasRes.data.filter(p => p.presente === 1).length;
          const percent = total > 0 ? Math.round((presentes / total) * 100) : 0;
          return {
            id: eq.id,
            nome: eq.nome,
            funcao: eq.funcao || eq.tipo || '',
            presenca: percent
          };
        } catch {
          return {
            id: eq.id,
            nome: eq.nome,
            funcao: eq.funcao || eq.tipo || '',
            presenca: 0
          };
        }
      }));
      setEquipes(equipesComPresenca);
    } catch {
      setEquipes([]);
      setErro('Erro ao buscar equipes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipes();
    // eslint-disable-next-line
  }, [agendaId]);

  const abrirDrawerEquipe = async equipe => {
    setDrawerEquipe(equipe);
    setUsuariosLoading(true);
    try {
      // Busca usuários da equipe
      const res = await axios.get(getApiUrl(`equipes/${equipe.id}/usuarios`));
      console.log('DEBUG usuarios equipe', equipe.id, res.data);
      // Garante que o nome está presente e normalizado
      const usuariosFormatados = (res.data || [])
        .map(u => ({
          ...u,
          nome: u.nome || u.NOME || u.nome_usuario || '',
          funcao: u.funcao || u.tipo_usuario || u.funcao_usuario || '',
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome)); // Ordena por nome A-Z
      setUsuarios(usuariosFormatados);
      // Corrige a rota para buscar presenças por evento e equipe
      const presencasRes = await axios.get(getApiUrl(`presencas/evento/${agendaId}/equipe/${equipe.id}`));
      const map = {};
      presencasRes.data.forEach(p => {
        map[p.usuario_id] = p.presente !== null && p.presente !== undefined ? Number(p.presente) : undefined;
      });
      setPresencasEdit(map);
    } catch {
      setUsuarios([]);
      setPresencasEdit({});
    } finally {
      setUsuariosLoading(false);
    }
  };

  const handleSelectChange = (usuarioId, value) => {
    setPresencasEdit(prev => ({ ...prev, [usuarioId]: value }));
  };

  const salvarPresencas = async () => {
    if (!drawerEquipe) return;
    setSaving(true);
    try {
      await Promise.all(
        usuarios.map(u => {
          const statusNum = presencasEdit[u.id] !== undefined ? presencasEdit[u.id] : 0;
          let statusStr = 'falta';
          if (statusNum === 1 || statusNum === '1') statusStr = 'ok';
          else if (statusNum === 2 || statusNum === '2') statusStr = 'justificada';
          // Corrige a rota para salvar presença por evento e equipe
          return axios.post(
            getApiUrl(`presencas/evento/${agendaId}/equipe/${drawerEquipe.id}/usuario/${u.id}`),
            { status: statusStr }
          );
        })
      );
      message.success('Presenças salvas com sucesso!');
      setDrawerEquipe(null);
      fetchEquipes(); // Atualiza porcentagem após salvar
      navigate('/presenca-equipes'); // Volta para tela inicial após salvar
    } catch {
      message.error('Erro ao salvar presenças.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1a1f3a' }}>
      {/* Header com foto e notificações */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 24px',
        background: '#1a1f3a'
      }}>
        <div></div> {/* Espaço vazio à esquerda */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Ícone de notificação */}
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <span style={{ fontSize: 20 }}>🔔</span>
          </div>
          {/* Foto do usuário */}
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f357a8, #7b2ff2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" 
              alt="Usuário" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>
      
      {/* Título */}
      <div style={{ padding: '20px 24px 40px 24px' }}>
        <h1 style={{ 
          fontSize: '24pt', 
          fontWeight: '600', 
          color: '#fff', 
          margin: 0,
          marginBottom: 8
        }}>
          Presença
        </h1>
        <p style={{ 
          color: '#a0a8b8', 
          fontSize: 16, 
          margin: 0,
          lineHeight: 1.5
        }}>
          Selecione o evento e marque a presença dos adolescentes e tios
        </p>
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 24,
        justifyContent: 'center',
        padding: '0 24px 32px 24px',
        background: '#1a1f3a',
      }}>
        {loading && <div style={{ color: '#fff' }}>Carregando equipes...</div>}
        {erro && !loading && <div style={{color: '#ff4d4f', fontWeight: 600}}>{erro}</div>}
        {!loading && !erro && equipes.length === 0 && <div style={{ color: '#fff' }}>Nenhuma equipe encontrada.</div>}
        {equipes.map(eq => (
          <div key={eq.id} style={{
            background: '#0F1528',
            borderRadius: 16,
            width: 320,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            marginBottom: 24,
            position: 'relative',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {/* Nome da equipe */}
            <div style={{ 
              fontWeight: '600', 
              fontSize: 18, 
              color: '#fff', 
              marginBottom: 8,
              lineHeight: 1.3
            }}>
              {eq.nome}
            </div>
            
            {/* Data */}
            <div style={{ 
              color: '#a0a8b8', 
              fontSize: 14, 
              marginBottom: 16,
              lineHeight: 1.4
            }}>
              {eq.funcao}
            </div>
            
            {/* Barra de progresso */}
            <div style={{ width: '100%', marginBottom: 12 }}>
              <div style={{ 
                height: 6, 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: 3, 
                overflow: 'hidden' 
              }}>
                <div style={{ 
                  width: `${eq.presenca}%`, 
                  height: '100%', 
                  background: eq.presenca > 0 ? '#4dabf7' : 'rgba(255,255,255,0.1)',
                  borderRadius: 3, 
                  transition: 'width 0.3s' 
                }} />
              </div>
            </div>
            
            {/* Porcentagem */}
            <div style={{ 
              color: '#fff', 
              fontSize: 16, 
              fontWeight: '500',
              marginBottom: 16
            }}>
              {eq.presenca}%
            </div>
            
            {/* Botão de acesso */}
            <button style={{
              width: '100%',
              height: 36,
              borderRadius: 8,
              background: 'transparent',
              color: '#4dabf7',
              fontWeight: '500',
              fontSize: 14,
              border: '1px solid #4dabf7',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
              onClick={() => abrirDrawerEquipe(eq)}
              onMouseEnter={(e) => {
                e.target.style.background = '#4dabf7';
                e.target.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#4dabf7';
              }}
            >
              → 
            </button>
          </div>
        ))}
      </div>
      <Drawer
        title={drawerEquipe ? `Equipe: ${drawerEquipe.nome}` : ''}
        placement="right"
        width={480}
        open={!!drawerEquipe}
        onClose={() => setDrawerEquipe(null)}
        bodyStyle={{ padding: 0, background: '#1a1f3a' }}
        headerStyle={{ background: '#1a1f3a', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
        closable
        styles={{
          header: { color: '#fff' },
          body: { background: '#1a1f3a' }
        }}
      >
        <div style={{ padding: 32, background: '#1a1f3a' }}>
          {usuariosLoading ? <Spin style={{ color: '#fff' }} /> : (
            <>
              <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 24, color: '#fff' }}>Usuários da equipe</h3>
              {usuarios.length === 0 && <div style={{ color: '#a0a8b8' }}>Nenhum usuário nesta equipe.</div>}
              {usuarios.map(usuario => (
                <div key={usuario.id} style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  padding: '18px 0',
                  gap: 12,
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: 18, color: '#fff', textTransform: 'capitalize' }}>{usuario.nome?.toLowerCase()}</span>
                    <span style={{ fontSize: 14, color: '#a0a8b8', margin: 0, lineHeight: 1.2 }}>{usuario.funcao || usuario.tipo_usuario || ''}</span>
                  </div>
                  <Select
                    value={presencasEdit[usuario.id] ?? undefined}
                    style={{ width: 140 }}
                    onChange={val => handleSelectChange(usuario.id, val)}
                    options={STATUS_OPTIONS}
                    placeholder="Selecione"
                  />
                </div>
              ))}
              {usuarios.length > 0 && (
                <div style={{ textAlign: 'right', marginTop: 32 }}>
                  <Button type="primary" onClick={salvarPresencas} loading={saving}>
                    Salvar Presenças
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default AgendaPresencaEquipes;
