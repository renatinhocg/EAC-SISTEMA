import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Spin, message, Tooltip, Input, Modal } from 'antd';
import { CheckOutlined, CloseOutlined, ExclamationOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title } = Typography;

interface Usuario {
  id: number;
  nome: string;
  funcao?: string;
  tipo_usuario?: string;
}

interface Props {
  agendaId: number;
  equipeId: number;
}

const CheckPresenca: React.FC<Props> = ({ agendaId, equipeId }) => {
  // ...existing code...
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [presencas, setPresencas] = useState<{ [usuarioId: number]: 'ok' | 'falta' | 'justificada' | undefined }>({});
  const [justificativaModal, setJustificativaModal] = useState<{ open: boolean, usuarioId?: number }>({ open: false });
  const [justificativa, setJustificativa] = useState('');

  // Cálculo da porcentagem de presença após os hooks
  const total = usuarios.length;
  const presentes = Object.values(presencas).filter(v => v === 'ok').length;
  const porcentagem = total > 0 ? Math.round((presentes / total) * 100) : 0;
  useEffect(() => {
    setLoading(true);
    api.get(`/equipes/${equipeId}/usuarios`)
      .then(res => setUsuarios(res.data))
      .catch(() => message.error('Erro ao carregar usuários da equipe'))
      .finally(() => setLoading(false));
    fetchPresencas();
  }, [equipeId]);

  const fetchPresencas = () => {
    api.get(`/presencas/evento/${agendaId}/equipe/${equipeId}`)
      .then(res => {
        const map: { [usuarioId: number]: 'ok' | 'falta' | 'justificada' | undefined } = {};
        res.data.forEach((p: any) => {
          map[p.usuario_id] = p.presente === 1 ? 'ok' : p.presente === 2 ? 'justificada' : 'falta';
        });
        setPresencas(map);
      })
      .catch(() => setPresencas({}));
  };

  const marcarPresenca = (usuarioId: number, status: 'ok' | 'falta' | 'justificada') => {
    if (status === 'justificada') {
      setJustificativaModal({ open: true, usuarioId });
    } else {
      api.post(`/presencas/evento/${agendaId}/equipe/${equipeId}/usuario/${usuarioId}`, { status })
        .then(() => {
          message.success('Presença atualizada!');
          fetchPresencas();
        })
        .catch(() => message.error('Erro ao salvar presença.'));
    }
  };

  const handleJustificativaOk = () => {
    if (justificativaModal.usuarioId) {
      api.post(`/presencas/evento/${agendaId}/equipe/${equipeId}/usuario/${justificativaModal.usuarioId}`, { status: 'justificada', justificativa })
        .then(() => {
          message.success('Justificativa salva!');
          fetchPresencas();
        })
        .catch(() => message.error('Erro ao salvar justificativa.'));
    }
    setJustificativaModal({ open: false });
    setJustificativa('');
  };

  const handleJustificativaCancel = () => {
    setJustificativaModal({ open: false });
    setJustificativa('');
    // Se cancelar, pode desfazer a marcação se desejar
    // setPresencas(prev => ({ ...prev, [justificativaModal.usuarioId!]: undefined }));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <Title level={2} style={{ marginBottom: 0, textAlign: 'left' }}>Presença</Title>
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8, textAlign: 'left' }}>
          Marque a presença dos membros da equipe
        </Typography.Text>
        <div style={{ marginBottom: 16 }}>
          <strong>Presença: {porcentagem}%</strong>
        </div>
        <Card bodyStyle={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
          {loading ? <Spin /> : (
            <>
              {usuarios.map(usuario => (
                <div key={usuario.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 18, color: '#222', textTransform: 'capitalize' }}>
                      {usuario.nome.toLowerCase()}
                    </div>
                    <div style={{ color: '#888', fontSize: 15, fontWeight: 500, marginTop: 2, textTransform: 'capitalize' }}>
                      {usuario.funcao || (usuario.tipo_usuario ? usuario.tipo_usuario : '')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      type="text"
                      icon={<CheckOutlined />}
                      style={{
                        background: presencas[usuario.id] === 'ok' ? '#52c41a' : '#f6ffed',
                        color: presencas[usuario.id] === 'ok' ? '#fff' : '#389e0d',
                        fontWeight: presencas[usuario.id] === 'ok' ? 700 : 400,
                        border: presencas[usuario.id] === 'ok' ? '2px solid #389e0d' : '2px solid #d9f7be',
                        opacity: presencas[usuario.id] && presencas[usuario.id] !== 'ok' ? 0.4 : 1,
                        pointerEvents: presencas[usuario.id] && presencas[usuario.id] !== 'ok' ? 'none' : 'auto',
                        boxShadow: 'none',
                        outline: 'none',
                        transition: 'background 0.2s, color 0.2s, opacity 0.2s, border 0.2s'
                      }}
                      onClick={() => marcarPresenca(usuario.id, 'ok')}
                    />
                    <Button
                      type="text"
                      icon={<CloseOutlined />}
                      style={{
                        background: presencas[usuario.id] === 'falta' ? '#ff4d4f' : '#fff1f0',
                        color: presencas[usuario.id] === 'falta' ? '#fff' : '#cf1322',
                        fontWeight: presencas[usuario.id] === 'falta' ? 700 : 400,
                        border: presencas[usuario.id] === 'falta' ? '2px solid #cf1322' : '2px solid #ffd6e7',
                        opacity: presencas[usuario.id] && presencas[usuario.id] !== 'falta' ? 0.4 : 1,
                        pointerEvents: presencas[usuario.id] && presencas[usuario.id] !== 'falta' ? 'none' : 'auto',
                        boxShadow: 'none',
                        outline: 'none',
                        transition: 'background 0.2s, color 0.2s, opacity 0.2s, border 0.2s'
                      }}
                      onClick={() => marcarPresenca(usuario.id, 'falta')}
                    />
                    <Tooltip title={presencas[usuario.id] === 'justificada' && justificativa ? justificativa : 'Justificar falta'} placement="top">
                      <Button
                        type="text"
                        icon={<ExclamationOutlined />}
                        style={{
                          background: presencas[usuario.id] === 'justificada' ? '#faad14' : '#fffbe6',
                          color: presencas[usuario.id] === 'justificada' ? '#fff' : '#d48806',
                          fontWeight: presencas[usuario.id] === 'justificada' ? 700 : 400,
                          border: presencas[usuario.id] === 'justificada' ? '2px solid #d48806' : '2px solid #ffe58f',
                          opacity: presencas[usuario.id] && presencas[usuario.id] !== 'justificada' ? 0.4 : 1,
                          pointerEvents: presencas[usuario.id] && presencas[usuario.id] !== 'justificada' ? 'none' : 'auto',
                          boxShadow: 'none',
                          outline: 'none',
                          transition: 'background 0.2s, color 0.2s, opacity 0.2s, border 0.2s'
                        }}
                        onClick={() => marcarPresenca(usuario.id, 'justificada')}
                      />
                    </Tooltip>
                  </div>
                </div>
              ))}
            </>
          )}
        </Card>
      </div>
      <Modal
        title="Justificativa da falta"
        open={justificativaModal.open}
        onOk={handleJustificativaOk}
        onCancel={handleJustificativaCancel}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <Input.TextArea
          value={justificativa}
          onChange={e => setJustificativa(e.target.value)}
          placeholder="Digite o motivo da justificativa"
          rows={4}
        />
      </Modal>
    </div>
  );
};

export default CheckPresenca;
