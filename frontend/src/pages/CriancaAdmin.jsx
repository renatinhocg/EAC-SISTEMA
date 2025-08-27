import React, { useEffect, useState } from "react";
import api from '../services/api';
import { Table, Typography, Card, Modal, Descriptions, Button } from 'antd';

export default function CriancaAdmin() {
  // Função para exportar CSV
  const exportCSV = () => {
    if (!criancas.length) return;
    const campos = [
      'usuario_id', 'equipe_id', 'telefone', 'nome', 'idade',
      'alergiaalimentar', 'alergiaalimentardesc',
      'alergiamedic', 'alergiamedicdesc',
      'alergiacontato', 'alergiacontatodesc',
      'restricaoalimentar', 'assinatura', 'createdat'
    ];
    const header = campos.join(',');
    const linhas = criancas.map(c => campos.map(f => `"${(c[f] ?? '').toString().replace(/"/g, '""')}"`).join(','));
    const csv = [header, ...linhas].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'criancas.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const [criancas, setCriancas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const { Title } = Typography;

  useEffect(() => {
    Promise.all([
      api.get('/crianca'),
      api.get('/usuarios'),
      api.get('/equipes')
    ]).then(([cri, usu, eq]) => {
      setCriancas(cri.data);
      setUsuarios(usu.data);
      setEquipes(eq.data);
      setLoading(false);
    });
  }, []);

  // Funções para buscar nomes
  const getUsuarioNome = id => {
    const u = usuarios.find(u => u.id === id);
    return u ? u.nome : '';
  };
  const getEquipeNome = id => {
    const e = equipes.find(e => e.id === id);
    return e ? e.nome : '';
  };

  const columns = [
    { title: 'Usuário', dataIndex: 'usuario_id', key: 'usuario_id', render: getUsuarioNome },
    { title: 'Equipe', dataIndex: 'equipe_id', key: 'equipe_id', render: getEquipeNome },
    { title: 'Nome da criança', dataIndex: 'nome', key: 'nome' },
    { title: 'Idade', dataIndex: 'idade', key: 'idade' },
    { title: 'Data de cadastro', key: 'createdat', render: (_, c) => c.createdat ? new Date(c.createdat).toLocaleString() : '' }
  ];

  const handleRowClick = record => {
    console.log('Dados da criança selecionada:', {
      alergiaAlimentar: record.alergiaAlimentar,
      alergiaMedic: record.alergiaMedic,
      alergiaContato: record.alergiaContato
    });
    setModalData(record);
    setModalOpen(true);
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Crianças cadastradas</Title>
        <Button type="primary" onClick={exportCSV}>Exportar CSV</Button>
      </div>
      {/* Cards de quantidade */}
      {!loading && (
        <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
          <Card style={{ minWidth: 180 }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Total cadastradas</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#2563eb' }}>{criancas.length}</div>
          </Card>
          <Card style={{ minWidth: 180 }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Equipes distintas</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#10b981' }}>{[...new Set(criancas.map(c => c.equipe_id))].length}</div>
          </Card>
        </div>
      )}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={criancas}
        loading={loading}
        pagination={{ pageSize: 20 }}
        onRow={record => ({ onClick: () => handleRowClick(record) })}
        style={{ cursor: 'pointer' }}
      />
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        title={modalData ? `Dados completos de ${modalData.nome}` : ''}
        width={600}
      >
        {modalData && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Usuário">{getUsuarioNome(modalData.usuario_id)}</Descriptions.Item>
            <Descriptions.Item label="Equipe">{getEquipeNome(modalData.equipe_id)}</Descriptions.Item>
            <Descriptions.Item label="Telefone">{modalData.telefone}</Descriptions.Item>
            <Descriptions.Item label="Nome da criança">{modalData.nome}</Descriptions.Item>
            <Descriptions.Item label="Idade">{modalData.idade}</Descriptions.Item>
            <Descriptions.Item label="Alergia Alimentar">{String(modalData.alergiaalimentar).trim().toLowerCase() === 'true' ? 'Sim' : 'Não'}</Descriptions.Item>
            <Descriptions.Item label="Descrição Alergia Alimentar">{modalData.alergiaalimentardesc}</Descriptions.Item>
            <Descriptions.Item label="Alergia Medicamentos">{String(modalData.alergiamedic).trim().toLowerCase() === 'true' ? 'Sim' : 'Não'}</Descriptions.Item>
            <Descriptions.Item label="Descrição Alergia Medicamentos">{modalData.alergiamedicdesc}</Descriptions.Item>
            <Descriptions.Item label="Alergia Contato">{String(modalData.alergiacontato).trim().toLowerCase() === 'true' ? 'Sim' : 'Não'}</Descriptions.Item>
            <Descriptions.Item label="Descrição Alergia Contato">{modalData.alergiacontatodesc}</Descriptions.Item>
            <Descriptions.Item label="Restrição Alimentar">{modalData.restricaoAlimentar}</Descriptions.Item>
            <Descriptions.Item label="Assinatura">{modalData.assinatura}</Descriptions.Item>
            <Descriptions.Item label="Data de envio">{modalData.createdat ? new Date(modalData.createdat).toLocaleString() : ''}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
