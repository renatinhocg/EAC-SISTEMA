import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeftOutlined } from '@ant-design/icons';
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
          const usuariosRes = await axios.get(getApiUrl('equipes/${eq.id}/usuarios'));
          const total = usuariosRes.data.length;
          const presencasRes = await axios.get(getApiUrl('presencas/evento/${agendaId}/equipe/${eq.id}'));
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
      const res = await axios.get(getApiUrl('equipes/${equipe.id}/usuarios'));
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
      const presencasRes = await axios.get(getApiUrl('presencas/evento/${agendaId}/equipe/${equipe.id}'));
      const map = {};
      presencasRes.data.forEach(p => {
        map[p.usuario_id] = p.presente !== null && p.presente !== undefined ? Number(p.presente) : undefined;
      });
      setPresencasEdit(map);
    } catch (e) {
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
            getApiUrl('presencas/evento/${agendaId}/equipe/${drawerEquipe.id}/usuario/${u.id}'),
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
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, padding: '32px 0 0 32px', background: '#fff' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 28,
            color: '#2d3954',
            marginRight: 16,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Voltar"
        >
          <ArrowLeftOutlined />
        </button>
        <h2 style={{ fontWeight: 800, fontSize: 32, color: '#2d3954', margin: 0 }}>Presença por Equipe</h2>
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 32,
        justifyContent: 'center',
        padding: 32,
        background: '#fff',
      }}>
        {loading && <div>Carregando equipes...</div>}
        {erro && !loading && <div style={{color: 'red', fontWeight: 600}}>{erro}</div>}
        {!loading && !erro && equipes.length === 0 && <div>Nenhuma equipe encontrada.</div>}
        {equipes.map(eq => (
          <div key={eq.id} style={{
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 2px 8px #f0f1f2',
            width: 320,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 24,
            position: 'relative', // Para posicionar a badge
          }}>
            <div style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }}>
              <span role="img" aria-label="equipe">👥</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 32, color: '#2d3954', marginBottom: 0 }}>{eq.nome}</div>
            <div style={{ color: '#6b7a90', fontSize: 20, marginBottom: 16 }}>{eq.funcao}</div>
            {/* Badge de porcentagem no canto superior direito */}
            <div style={{
              position: 'absolute',
              top: 18,
              right: 24,
              background: '#006aff',
              color: '#fff',
              borderRadius: 12,
              padding: '2px 12px',
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 2px 8px #e3e8f0',
              zIndex: 2,
            }}>{eq.presenca}%</div>
            <div style={{ width: '100%', margin: '16px 0 0 0' }}>
              <div style={{ height: 12, background: '#e3e8f0', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ width: `${eq.presenca}%`, height: '100%', background: '#006aff', borderRadius: 8, transition: 'width 0.3s' }} />
              </div>
              <div style={{ textAlign: 'center', fontWeight: 500, color: '#2d3954', marginTop: 6, fontSize: 17 }}>{eq.presenca}% presença</div>
            </div>
            <button style={{
              marginTop: 32,
              width: 200,
              height: 44,
              borderRadius: 22,
              background: '#2d3954',
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px #e3e8f0',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
              onClick={() => abrirDrawerEquipe(eq)}
            >acessar</button>
          </div>
        ))}
      </div>
      <Drawer
        title={drawerEquipe ? `Equipe: ${drawerEquipe.nome}` : ''}
        placement="right"
        width={480}
        open={!!drawerEquipe}
        onClose={() => setDrawerEquipe(null)}
        bodyStyle={{ padding: 0, background: '#fff' }}
        headerStyle={{ background: '#fff', borderBottom: '1px solid #f0f1f2' }}
        closable
      >
        <div style={{ padding: 32 }}>
          {usuariosLoading ? <Spin /> : (
            <>
              <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Usuários da equipe</h3>
              {usuarios.length === 0 && <div>Nenhum usuário nesta equipe.</div>}
              {usuarios.map(usuario => (
                <div key={usuario.id} style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #f0f1f2',
                  padding: '18px 0',
                  gap: 12,
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: 18, color: '#222', textTransform: 'capitalize' }}>{usuario.nome?.toLowerCase()}</span>
                    <span style={{ fontSize: 14, color: '#888', margin: 0, lineHeight: 1.2 }}>{usuario.funcao || usuario.tipo_usuario || ''}</span>
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
