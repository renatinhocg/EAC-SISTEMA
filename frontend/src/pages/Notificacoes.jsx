import React, { useEffect, useState, useCallback } from 'react';
import { Table, Typography, Button, Space, Popconfirm, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';

const { Title } = Typography;

const Notificacoes = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [filterEquipe, setFilterEquipe] = useState(null);
  const [loading, setLoading] = useState(false);

  // Carregar equipes para filtro e render
  useEffect(() => {
    axios.get(getApiUrl('equipes'))
      .then(res => setEquipes(res.data))
      .catch(() => {});
  }, []);

  const loadData = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filterEquipe) params.equipe_id = filterEquipe;
    axios.get(getApiUrl('notificacoes'), { params })
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        setData(list);
      })
      .catch(() => message.error('Erro ao carregar notificações'))
      .finally(() => setLoading(false));
  }, [filterEquipe]);

  useEffect(() => { loadData(); }, [loadData]);

  const columns = [
    { title: 'Título', dataIndex: 'titulo', key: 'titulo' },
    { title: 'Descrição', dataIndex: 'descricao', key: 'descricao' },
    { title: 'Para Todos', dataIndex: 'para_todos', key: 'para_todos', render: v => v ? 'Sim' : 'Não' },
    { title: 'Equipe', dataIndex: 'equipe_id', key: 'equipe_id', render: id => id ? equipes.find(e => e.id === id)?.nome : 'Todos' },
    {
      title: 'Ações', key: 'actions', render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/notificacoes/${record.id}/editar`)} />
          <Popconfirm title="Tem certeza?" onConfirm={() => axios.delete(getApiUrl('notificacoes/${record.id}')).then(() => { message.success('Notificação deletada'); loadData(); }).catch(() => message.error('Erro ao deletar notificação'))} okText="Sim" cancelText="Não">
            <Button type="link" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Notificações</Title>
        <Space>
          <Select placeholder="Filtrar por Equipe" allowClear style={{ width: 200 }} value={filterEquipe} onChange={setFilterEquipe} options={[{ label: 'Todos', value: null }, ...equipes.map(e => ({ label: e.nome, value: e.id }))]} />
          <Button icon={<ReloadOutlined />} onClick={loadData}>Atualizar</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/notificacoes/novo')}>Nova Notificação</Button>
        </Space>
      </div>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={{ pageSize: 5 }} />
    </div>
  );
};

export default Notificacoes;
