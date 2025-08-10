import React, { useEffect, useState } from 'react';
import { Table, Typography, Button, Space, Popconfirm, message, Card, Avatar } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';

const { Title } = Typography;

const Equipes = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  const fetchData = () => {
    axios.get(getApiUrl('equipes'))
      .then(res => setData(res.data))
      .catch(() => message.error('Erro ao carregar equipes'));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = () => navigate('/equipes/novo');
  const handleEdit = record => navigate(`/equipes/${record.id}/editar`);
  const handleDelete = id => {
    axios.delete(getApiUrl(`equipes/${id}`))
      .then(() => { message.success('Equipe deletada'); fetchData(); })
      .catch(() => message.error('Erro ao deletar equipe'));
  };

  const columns = [
    {
      title: 'Ícone',
      dataIndex: 'imagem',
      key: 'imagem',
      width: 80,
      render: (imagem) => (
        <Avatar
          size={40}
          src={imagem ? getApiUrl(`uploads/equipes/${imagem}`) : null}
          icon={!imagem ? <TeamOutlined /> : null}
          style={{ backgroundColor: !imagem ? '#f56a00' : undefined }}
        />
      )
    },
    { title: 'Nome', dataIndex: 'nome', key: 'nome' },
    { title: 'Função', dataIndex: 'funcao', key: 'funcao' },
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
    <Card
      title={<Title level={3} style={{ margin: 0 }}>Equipes</Title>}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>Nova Equipe</Button>}
      style={{ marginBottom: 16 }}
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={Array.isArray(data) ? data : []}
      />
    </Card>
  );
};

export default Equipes;
