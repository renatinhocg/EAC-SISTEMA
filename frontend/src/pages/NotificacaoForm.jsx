import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Card, Select, Switch } from 'antd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiUrl } from '../config/api';

const NotificacaoForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [equipes, setEquipes] = useState([]);

  useEffect(() => {
    // Carregar equipes para seleção
    axios.get(getApiUrl('equipes'))
      .then(res => setEquipes(res.data))
      .catch(() => {});

    if (isEdit) {
      axios.get(getApiUrl(`notificacoes/${id}`))
        .then(res => {
          const { titulo, descricao, para_todos, equipe_id } = res.data;
          form.setFieldsValue({
            titulo,
            descricao,
            para_todos: Boolean(para_todos),
            equipe_id: equipe_id ?? null
          });
        })
        .catch(() => message.error('Erro ao carregar notificação'));
    }
  }, [id, isEdit, form]);

  const onFinish = async values => {
    try {
      const payload = {
        titulo: values.titulo,
        descricao: values.descricao,
        para_todos: values.para_todos,
        equipe_id: values.equipe_id ?? null
      };
      if (isEdit) {
        await axios.put(getApiUrl(`notificacoes/${id}`), payload);
        message.success('Notificação atualizada com sucesso');
      } else {
        await axios.post(getApiUrl('notificacoes'), payload);
        message.success('Notificação criada com sucesso');
      }
  navigate('/admin/notificacoes');
    } catch (err) {
      console.error('Erro ao salvar notificação:', err);
      message.error('Erro ao salvar notificação');
    }
  };

  return (
    <Card title={isEdit ? 'Editar Notificação' : 'Nova Notificação'} style={{ maxWidth: 600, margin: '0 auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ titulo: '', descricao: '', para_todos: false, equipe_id: null }}
      >
        <Form.Item name="titulo" label="Título" rules={[{ required: true, message: 'Informe o título' }]}>        
          <Input />
        </Form.Item>
        <Form.Item name="descricao" label="Descrição">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="para_todos" label="Para todos" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="equipe_id" label="Equipe">
          <Select placeholder="Selecione equipe ou deixe em branco para todos" allowClear>
            {equipes.map(e => (
              <Select.Option key={e.id} value={e.id}>{e.nome}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {isEdit ? 'Atualizar' : 'Criar'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/admin/notificacoes')}>
            Cancelar
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default NotificacaoForm;
