import React, { useEffect, useState, useCallback } from 'react';
import { Table, Typography, Button, Space, Popconfirm, message, Select, Form, Input, Modal } from 'antd';
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
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carregar equipes e usuários para filtro e envio de push
  useEffect(() => {
    axios.get(getApiUrl('equipes'))
      .then(res => setEquipes(res.data))
      .catch(() => {});
    axios.get(getApiUrl('usuarios'))
      .then(res => setUsuarios(res.data))
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
    { title: 'Status', dataIndex: 'status', key: 'status', render: v => v === 'push' ? <span style={{color:'#1890ff'}}>Push</span> : 'Manual' },
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

  // Formulário de envio de push notification
  const [pushModalOpen, setPushModalOpen] = useState(false);
  const [pushForm] = Form.useForm();
  const [pushLoading, setPushLoading] = useState(false);

  const handleSendPush = async (values) => {
    setPushLoading(true);
    try {
      // Se usuário selecionado, remove equipe_id
      if (values.usuario_id) values.equipe_id = undefined;
      await axios.post(getApiUrl('push/send-notification'), values);
      message.success('Push enviado!');
      setPushModalOpen(false);
      pushForm.resetFields();
    } catch {
      message.error('Erro ao enviar push');
    } finally {
      setPushLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Notificações</Title>
        <Space>
          <Button onClick={() => setPushModalOpen(true)} type="default">Enviar Push</Button>
          <Select placeholder="Filtrar por Equipe" allowClear style={{ width: 200 }} value={filterEquipe} onChange={setFilterEquipe} options={[{ label: 'Todos', value: null }, ...equipes.map(e => ({ label: e.nome, value: e.id }))]} />
          <Button icon={<ReloadOutlined />} onClick={loadData}>Atualizar</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/notificacoes/novo')}>Nova Notificação</Button>
        </Space>
      </div>
      <Modal
        title="Enviar Push Notification"
        open={pushModalOpen}
        onCancel={() => setPushModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" form={pushForm} onFinish={handleSendPush}>
          <Form.Item name="title" label="Título" rules={[{ required: true, message: 'Informe o título' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="body" label="Mensagem" rules={[{ required: true, message: 'Informe a mensagem' }]}> 
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="url" label="URL ao clicar (opcional)">
            <Input />
          </Form.Item>
          <Form.Item name="equipe_id" label="Equipe (opcional)">
            <Select
              allowClear
              placeholder="Selecione uma equipe"
              options={equipes.map(e => ({ label: e.nome, value: e.id }))}
            />
          </Form.Item>
          <Form.Item name="usuario_id" label="Usuário (opcional)">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Selecione um usuário"
              options={usuarios.map(u => ({ label: `${u.nome} (${u.email})`, value: u.id }))}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={pushLoading}>Enviar</Button>
          </Form.Item>
        </Form>
      </Modal>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={{ pageSize: 5 }} />
    </div>
  );
};

export default Notificacoes;
