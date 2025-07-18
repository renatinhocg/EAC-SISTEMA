import React, { useEffect, useState } from 'react';
import { Table, Typography, Button, Space, Popconfirm, message, Card } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Equipes = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  const fetchData = () => {
    axios.get('http://localhost:3001/equipes')
      .then(res => setData(res.data))
      .catch(() => message.error('Erro ao carregar equipes'));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = () => navigate('/equipes/novo');
  const handleEdit = record => navigate(`/equipes/${record.id}/editar`);
  const handleDelete = id => {
    axios.delete(`http://localhost:3001/equipes/${id}`)
      .then(() => { message.success('Equipe deletada'); fetchData(); })
      .catch(() => message.error('Erro ao deletar equipe'));
  };

  const columns = [
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
