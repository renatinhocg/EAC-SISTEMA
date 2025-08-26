import React, { useEffect } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiUrl } from '../config/api';

const TipoCirculoForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      axios.get(getApiUrl(`tipo_circulo/${id}`))
        .then(res => form.setFieldsValue(res.data))
        .catch(() => message.error('Erro ao carregar tipo de círculo'));
    }
  }, [id, isEdit, form]);

  const onFinish = async (values) => {
    try {
      if (isEdit) {
        await axios.put(getApiUrl(`tipo_circulo/${id}`), values);
        message.success('Tipo de círculo atualizado com sucesso');
      } else {
        await axios.post(getApiUrl('tipo_circulo'), values);
        message.success('Tipo de círculo criado com sucesso');
      }
  navigate('/admin/tipo_circulo');
    } catch {
      message.error('Erro ao salvar tipo de círculo');
    }
  };

  return (
    <Card title={isEdit ? 'Editar Tipo de Círculo' : 'Novo Tipo de Círculo'} style={{ maxWidth: 600, margin: '0 auto' }}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ nome: '' }}>
        <Form.Item name="nome" label="Nome" rules={[{ required: true, message: 'Informe o nome' }]}>        
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {isEdit ? 'Atualizar' : 'Criar'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/admin/tipo_circulo')}>
            Cancelar
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default TipoCirculoForm;
