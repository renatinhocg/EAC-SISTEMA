import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Select, Button, message } from 'antd';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'react-router-dom';

const { Title } = Typography;

interface Equipe { id: number; nome: string }
interface Usuario { id: number; nome: string; funcao?: string }

const STATUS_OPTIONS = [
  { value: 1, label: 'Presente' },
  { value: 0, label: 'Falta' },
  { value: 2, label: 'Justificada' },
];

const PresencaEquipe: React.FC = () => {
  const { user } = useAuth();
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [presencas, setPresencas] = useState<{ [usuarioId: number]: number | undefined }>({});
  const [loading, setLoading] = useState(false);
  const [equipeId, setEquipeId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const location = useLocation();
  // Pega agendaId da query string
  const searchParams = new URLSearchParams(location.search);
  const agendaId = searchParams.get('agendaId');
  const [agenda, setAgenda] = useState<{ id: number; titulo: string } | null>(null);

  // Carrega equipes do coordenador
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.get('/equipes', { params: { coordenador_id: user.id } })
      .then(res => {
        setEquipes(res.data);
        // Se só existe uma equipe, já seleciona automaticamente, mas mantém o select visível
        if (res.data.length === 1) {
          setEquipeId(res.data[0].id);
        }
      })
      .catch(() => message.error('Erro ao carregar equipes'))
      .finally(() => setLoading(false));
  }, [user]);

  // Carrega usuários e presenças da equipe selecionada
  useEffect(() => {
    if (!equipeId || !agendaId) return;
    setLoading(true);
    Promise.all([
      api.get(`/equipes/${equipeId}/usuarios`),
      api.get(`/presencas/evento/${agendaId}/equipe/${equipeId}`)
    ])
      .then(([usuariosRes, presencasRes]) => {
        setUsuarios(usuariosRes.data);
        const map: { [usuarioId: number]: number } = {};
        (presencasRes.data || []).forEach((p: { usuario_id: number; presente: number | null }) => {
          map[p.usuario_id] = p.presente !== null && p.presente !== undefined ? Number(p.presente) : 0;
        });
        setPresencas(map);
      })
      .catch(() => message.error('Erro ao carregar usuários ou presenças'))
      .finally(() => setLoading(false));
  }, [equipeId, agendaId]);

  // Carrega dados da agenda (evento)
  useEffect(() => {
    if (!agendaId) return;
    api.get(`/agendas/${agendaId}`)
      .then(res => setAgenda(res.data))
      .catch(() => setAgenda(null));
  }, [agendaId]);

  const handleSelectChange = (usuarioId: number, value: number) => {
    setPresencas(prev => ({ ...prev, [usuarioId]: value }));
  };

  // Função para calcular a porcentagem de presença
  const calcularPorcentagem = () => {
    if (usuarios.length === 0) return 0;
    const presentes = Object.values(presencas).filter(v => v === 1).length;
    return Math.round((presentes / usuarios.length) * 100);
  };

  const salvarPresencas = async () => {
    if (!equipeId || !agendaId) return;
    setSaving(true);
    try {
      await Promise.all(
        usuarios.map(u => {
          const statusNum = presencas[u.id] !== undefined ? presencas[u.id] : 0;
          let statusStr = 'falta';
          if (statusNum === 1) statusStr = 'ok';
          else if (statusNum === 2) statusStr = 'justificada';
          return api.post(
            `/presencas/evento/${agendaId}/equipe/${equipeId}/usuario/${u.id}`,
            { status: statusStr }
          );
        })
      );
      message.success('Presenças salvas com sucesso!');
      // Atualiza lista de presenças após salvar
      Promise.all([
        api.get(`/equipes/${equipeId}/usuarios`),
        api.get(`/presencas/evento/${agendaId}/equipe/${equipeId}`)
      ]).then(([usuariosRes, presencasRes]) => {
        setUsuarios(usuariosRes.data);
        const map: { [usuarioId: number]: number } = {};
        (presencasRes.data || []).forEach((p: { usuario_id: number; presente: number | null }) => {
          map[p.usuario_id] = p.presente !== null && p.presente !== undefined ? Number(p.presente) : 0;
        });
        setPresencas(map);
      });
    } catch {
      message.error('Erro ao salvar presenças.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Title level={2}>Presença da Equipe</Title>
        <Card bodyStyle={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
          {equipes.length === 1 && equipeId ? (
            <>
              <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 4, textAlign: 'center' }}>{equipes[0].nome}</div>
              {agenda && (
                <div style={{ color: '#888', fontSize: 16, marginBottom: 12, textAlign: 'center' }}>{agenda.titulo}</div>
              )}
              <div style={{ width: '100%', margin: '0 0 18px 0' }}>
                <div style={{ height: 12, background: '#e3e8f0', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${calcularPorcentagem()}%`, height: '100%', background: '#006aff', borderRadius: 8, transition: 'width 0.3s' }} />
                </div>
                <div style={{ textAlign: 'center', fontWeight: 500, color: '#2d3954', marginTop: 6, fontSize: 17 }}>{calcularPorcentagem()}% presença</div>
              </div>
            </>
          ) : (
            <Select
              placeholder="Selecione a equipe"
              style={{ width: '100%', marginBottom: 24 }}
              value={equipeId}
              onChange={setEquipeId}
              options={equipes.map(e => ({ label: e.nome, value: e.id }))}
              allowClear
            />
          )}
          {loading ? <Spin /> : (
            <>
              {usuarios.length === 0 && <div>Nenhum usuário nesta equipe.</div>}
              {usuarios.map(usuario => (
                <div key={usuario.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f1f2', padding: '12px 0' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{usuario.nome}</span>
                    <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>{usuario.funcao || ''}</span>
                  </div>
                  <Select
                    value={presencas[usuario.id] ?? undefined}
                    style={{ width: 120 }}
                    onChange={val => handleSelectChange(usuario.id, val)}
                    options={STATUS_OPTIONS}
                    placeholder="Selecione"
                  />
                </div>
              ))}
              {usuarios.length > 0 && (
                <div style={{ textAlign: 'right', marginTop: 24 }}>
                  <Button type="primary" onClick={salvarPresencas} loading={saving}>
                    Salvar Presenças
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PresencaEquipe;
