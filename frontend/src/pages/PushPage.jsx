import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Typography, Space, Table } from 'antd';
import axios from 'axios';
import { getApiUrl } from '../config/api';

const { Title } = Typography;

const PushPage = () => {
  const [equipes, setEquipes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [pushHistory, setPushHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);


  useEffect(() => {
    axios.get(getApiUrl('equipes')).then(res => setEquipes(res.data)).catch(() => {});
    axios.get(getApiUrl('usuarios')).then(res => setUsuarios(res.data)).catch(() => {});
    loadPushHistory();
  }, []);

  const loadPushHistory = () => {
    setHistoryLoading(true);
  axios.get(getApiUrl('pushs_enviados')).then(res => {
      const list = Array.isArray(res.data) ? res.data : [];
      setPushHistory(list);
    }).catch(() => {}).finally(() => setHistoryLoading(false));
  };

  const handleSendPush = async (values) => {
    setLoading(true);
    try {
      if (values.usuario_id) values.equipe_id = undefined;
      await axios.post(getApiUrl('push/send-notification'), values);
      message.success('Push enviado!');
      form.resetFields();
      loadPushHistory();
    } catch {
      message.error('Erro ao enviar push');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Título', dataIndex: 'titulo', key: 'titulo' },
    { title: 'Mensagem', dataIndex: 'mensagem', key: 'mensagem' },
    { title: 'Data', dataIndex: 'data_envio', key: 'data_envio', render: v => v ? (typeof v === 'string' ? v : new Date(v).toLocaleString()) : '-' },
  ];

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 32 }}>
      <Title level={2}>Enviar Push Notification</Title>
      <Form layout="vertical" form={form} onFinish={handleSendPush}>
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
          <Select allowClear placeholder="Selecione uma equipe" options={equipes.map(e => ({ label: e.nome, value: e.id }))} />
        </Form.Item>
        <Form.Item name="usuario_id" label="Usuário (opcional)">
          <Select allowClear showSearch optionFilterProp="label" placeholder="Selecione um usuário" options={usuarios.map(u => ({ label: `${u.nome} (${u.email})`, value: u.id }))} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>Enviar</Button>
            <Button htmlType="reset" onClick={() => form.resetFields()}>Limpar</Button>
          </Space>
        </Form.Item>
      </Form>
      <div style={{marginTop:40}}>
        <Title level={4}>Histórico de Push enviados</Title>
        <Table rowKey="id" columns={columns} dataSource={pushHistory} loading={historyLoading} pagination={{ pageSize: 5 }} />
      </div>
    </div>
  );
};

export default PushPage;
