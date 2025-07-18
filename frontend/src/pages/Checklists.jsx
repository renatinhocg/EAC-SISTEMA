import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';

const Checklists = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [equipes, setEquipes] = useState([]);

  const fetchData = () => {
    setLoading(true);
    axios.get(getApiUrl('checklists'))
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        setData(list);
      })
      .catch(() => message.error('Erro ao carregar checklists'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  // Carregar equipes para mapear nomes
  useEffect(() => {
    axios.get(getApiUrl('equipes'))
      .then(res => setEquipes(res.data))
      .catch(() => {});
  }, []);

  const handleCreate = () => navigate('/checklists/novo');
  const handleEdit = record => navigate(`/checklists/${record.id}/editar`);
  const handleDelete = id => {
    axios.delete(getApiUrl(`checklists/${id}`))
      .then(() => { message.success('Checklist deletada'); fetchData(); })
      .catch(() => message.error('Erro ao deletar checklist'));
  };

  const columns = [
    { title: 'Título', dataIndex: 'titulo', key: 'titulo' },
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo',
      render: tipo => {
        if (tipo === 'pré-encontro') return 'Pré-encontro';
        if (tipo === 'durante o encontro') return 'Durante o encontro';
        if (tipo === 'pós-encontro') return 'Pós-encontro';
        return tipo;
      }
    },
    { title: 'Descrição', dataIndex: 'descricao', key: 'descricao' },
    {
      title: 'Equipes', dataIndex: 'equipe_ids', key: 'equipe_ids', render: ids =>
        Array.isArray(ids)
          ? ids.map(id => equipes.find(e => e.id === id)?.nome || id).join(', ')
          : ''
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
        <h2>Checklists</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>Nova Checklist</Button>
      </div>
      <Table rowKey="id" dataSource={data} columns={columns} loading={loading} />
    </div>
  );
};

export default Checklists;
