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
    <div style={{ padding: '24px' }}>
      <Title level={2}>Presença</Title>
      <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
        Selecione uma equipe e marque a presença dos adolescentes e tios
      </Text>

      {loading && <div>Carregando equipes...</div>}
      {erro && !loading && <div style={{ color: '#ff4d4f', fontWeight: 600 }}>{erro}</div>}
      {!loading && !erro && equipes.length === 0 && <div>Nenhuma equipe encontrada.</div>}
      
      <Row gutter={[16, 16]}>
        {equipes.map(eq => (
          <Col key={eq.id} xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              title={eq.nome}
              extra={<Button type="primary" size="small" onClick={() => abrirDrawerEquipe(eq)}>Acessar</Button>}
              style={{ height: '100%' }}
              size="small"
            >
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>{eq.funcao}</Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ fontSize: '14px' }}>Presença: {eq.presenca}%</Text>
              </div>
              <Progress percent={eq.presenca} size="small" />
            </Card>
          </Col>
        ))}
      </Row>
      <Drawer
        title={drawerEquipe ? `Equipe: ${drawerEquipe.nome}` : ''}
        placement="right"
        width={600}
        open={!!drawerEquipe}
        onClose={() => setDrawerEquipe(null)}
      >
        <div style={{ padding: '0 16px' }}>
          {usuariosLoading ? <Spin /> : (
            <>
              <Title level={4} style={{ marginBottom: 24 }}>Usuários da equipe</Title>
              {usuarios.length === 0 && <Text type="secondary">Nenhum usuário nesta equipe.</Text>}
              {usuarios.map(usuario => (
                <Card key={usuario.id} size="small" style={{ marginBottom: 8 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}>
                    <div>
                      <div><Text strong>{usuario.nome}</Text></div>
                      <div><Text type="secondary" size="small">{usuario.funcao || usuario.tipo_usuario || ''}</Text></div>
                    </div>
                    <Select
                      value={presencasEdit[usuario.id] ?? undefined}
                      style={{ width: 140 }}
                      onChange={val => handleSelectChange(usuario.id, val)}
                      options={STATUS_OPTIONS}
                      placeholder="Selecione"
                    />
                  </div>
                </Card>
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
        </div>
      </Drawer>
    </div>
  );
};

export default AgendaPresencaEquipes;
