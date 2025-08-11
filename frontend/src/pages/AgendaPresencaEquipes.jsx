


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Drawer, Spin, Select, Button, message, Card, Row, Col, Progress, Typography } from 'antd';
import { getApiUrl } from '../config/api';

const { Title, Text } = Typography;

const STATUS_OPTIONS = [
  { value: 1, label: 'Presente' },
  { value: 0, label: 'Falta' },
  { value: 2, label: 'Justificada' },
];

const AgendaPresencaEquipes = () => {
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [drawerEquipe, setDrawerEquipe] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [presencasEdit, setPresencasEdit] = useState({});
  const [saving, setSaving] = useState(false);
  const [agendaTitulo, setAgendaTitulo] = useState('');
  const navigate = useNavigate();
  const { agendaId } = useParams();

  useEffect(() => {
    if (!agendaId) {
      setAgendaTitulo('Evento não selecionado');
      return;
    }
    axios.get(getApiUrl(`agendas/${agendaId}`))
      .then(res => {
        setAgendaTitulo(res.data?.titulo || 'Evento sem título');
      })
      .catch(() => setAgendaTitulo('Evento não encontrado'));
  }, [agendaId]);

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
            presenca: percent,
            descricao: eq.descricao || ''
          };
        } catch {
          return {
            id: eq.id,
            nome: eq.nome,
            funcao: eq.funcao || eq.tipo || '',
            presenca: 0,
            descricao: eq.descricao || ''
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
      const res = await axios.get(getApiUrl(`equipes/${equipe.id}/usuarios`));
      const usuariosFormatados = (res.data || [])
        .map(u => ({
          ...u,
          nome: u.nome || u.NOME || u.nome_usuario || '',
          funcao: u.funcao || u.tipo_usuario || u.funcao_usuario || '',
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome));
      setUsuarios(usuariosFormatados);
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
      await axios.post(getApiUrl(`presencas/salvar`), {
        presencas: presencasEdit,
        agendaId,
        equipeId: drawerEquipe.id
      });
      message.success('Presenças salvas com sucesso!');
      setDrawerEquipe(null);
      fetchEquipes();
    } catch {
      message.error('Erro ao salvar presenças.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1>Presença: <span style={{ color: '#722ed1' }}>{agendaTitulo}</span></h1>
      {loading ? (
        <Spin />
      ) : erro ? (
        <div style={{ color: 'red', margin: 24 }}>{erro}</div>
      ) : (
        <Row gutter={[16, 16]}>
          {equipes.map(equipe => (
            <Col key={equipe.id} xs={24} sm={12} md={8} lg={6} xl={6}>
              <Card
                title={equipe.nome}
                extra={<Button type="primary" onClick={() => abrirDrawerEquipe(equipe)}>Acessar</Button>}
                style={{ minHeight: 180 }}
              >
                <div style={{ fontWeight: 500, marginBottom: 8 }}>
                  Presença: {equipe.presenca}%
                </div>
                <Progress percent={equipe.presenca} size="small" status={equipe.presenca === 100 ? 'success' : 'normal'} />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Drawer
        title={drawerEquipe ? `Presença - ${drawerEquipe.nome}` : 'Presença'}
        placement="right"
        width={480}
        onClose={() => setDrawerEquipe(null)}
        open={!!drawerEquipe}
      >
        {usuariosLoading ? (
          <Spin />
        ) : (
          <>
            {usuarios.map(u => (
              <div key={u.id} style={{ marginBottom: 16 }}>
                <Text strong>{u.nome}</Text>
                <Select
                  value={presencasEdit[u.id] !== undefined ? presencasEdit[u.id] : 0}
                  onChange={value => handleSelectChange(u.id, value)}
                  style={{ width: 160, marginLeft: 16 }}
                  options={STATUS_OPTIONS}
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
      </Drawer>
    </div>
  );
};

export default AgendaPresencaEquipes;
