import React, { useEffect, useState, useCallback } from 'react';
import { Table, Typography, Button, Space, Popconfirm, message, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Reflexoes = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [agendas, setAgendas] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [filterAgenda, setFilterAgenda] = useState(null);
  const [filterEquipe, setFilterEquipe] = useState(null);

  // Carrega opções de agendas e equipes
  useEffect(() => {
    axios.get('http://localhost:3001/agendas')
      .then(res => setAgendas(res.data))
      .catch(() => {});
    axios.get('http://localhost:3001/equipes')
      .then(res => setEquipes(res.data))
      .catch(() => {});
  }, []);

  // Função para carregar reflexões com filtros
  const loadReflexoes = useCallback(() => {
    const params = {};
    if (filterAgenda) params.agenda_id = filterAgenda;
    if (filterEquipe) params.equipe_id = filterEquipe;
    axios.get('http://localhost:3001/reflexoes', { params })
      .then(res => setData(res.data))
      .catch(() => message.error('Erro ao carregar reflexões'));
  }, [filterAgenda, filterEquipe]);

  // Recarrega reflexões ao alterar filtros
  useEffect(() => { loadReflexoes(); }, [loadReflexoes]);

  const handleCreate = () => navigate('/reflexoes/novo');
  const handleEdit = record => navigate(`/reflexoes/${record.id}/editar`);
  const handleDelete = id => {
    axios.delete(`http://localhost:3001/reflexoes/${id}`)
      .then(() => { message.success('Reflexão deletada'); loadReflexoes(); })
      .catch(() => message.error('Erro ao deletar reflexão'));
  };

  const columns = [
    { title: 'Texto', dataIndex: 'texto', key: 'texto' },
    { title: 'Usuário', dataIndex: 'usuario_nome', key: 'usuario_nome' },
    { title: 'Evento', dataIndex: 'agenda_titulo', key: 'agenda_titulo' },
    {
      title: 'Equipe',
      dataIndex: 'equipes_nomes',
      key: 'equipes_nomes',
      render: (text) => text ? text : <span style={{ color: '#bbb' }}>-</span>
    },
    {
      title: 'Ações', key: 'actions', render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Tem certeza?" onConfirm={() => handleDelete(record.id)} okText="Sim" cancelText="Não">
            <Button type="link" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Reflexões</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>Nova Reflexão</Button>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Select
          placeholder="Filtrar por Evento"
          allowClear
          style={{ width: 200 }}
          value={filterAgenda}
          onChange={setFilterAgenda}
          options={agendas.map(a => ({ label: a.titulo, value: a.id }))}
        />
        <Select
          placeholder="Filtrar por Equipe"
          style={{ width: 200 }}
          value={filterEquipe}
          onChange={setFilterEquipe}
          options={[
            { label: 'Todos', value: null },
            ...equipes.map(e => ({ label: e.nome, value: e.id }))
          ]}
        />
        <Button icon={<ReloadOutlined />} onClick={loadReflexoes}>Atualizar</Button>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
      />
    </div>
  );
};

export default Reflexoes;
