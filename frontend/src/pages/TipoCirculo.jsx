import React, { useEffect, useState } from 'react';
import { Table, Typography, Button, Space, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';

const { Title } = Typography;

const TipoCirculo = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  const fetchData = () => {
    axios.get(getApiUrl('tipo_circulo'))
      .then(res => setData(res.data))
      .catch(() => message.error('Erro ao carregar tipos de círculo'));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = () => navigate('/admin/tipo_circulo/novo');
  const handleEdit = record => navigate(`/admin/tipo_circulo/${record.id}/editar`);
  const handleDelete = id => {
    axios.delete(getApiUrl(`tipo_circulo/${id}`))
      .then(() => { message.success('Tipo de círculo deletado'); fetchData(); })
      .catch(() => message.error('Erro ao deletar tipo de círculo'));
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Nome', dataIndex: 'nome', key: 'nome' },
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
        <Title level={2}>Tipos de Círculo</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>Novo Tipo</Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={data} />
    </div>
  );
};

export default TipoCirculo;
