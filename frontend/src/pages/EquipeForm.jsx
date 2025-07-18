import React, { useEffect, useRef } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiUrl } from '../config/api';

const EquipeForm = () => {
  const descRef = useRef(null);
  const sobreRef = useRef(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      axios.get(getApiUrl(`equipes/${id}`))
        .then(res => {
          form.setFieldsValue({ nome: res.data.nome, funcao: res.data.funcao });
          if (descRef.current) descRef.current.innerHTML = res.data.descricao || '';
          if (sobreRef.current) sobreRef.current.innerHTML = res.data.sobre || '';
        })
        .catch(() => message.error('Erro ao carregar equipe'));
    }
  }, [id, isEdit, form]);

  const onFinish = async (values) => {
    try {
      const payload = {
        ...values,
        descricao: descRef.current?.innerHTML || '',
        sobre: sobreRef.current?.innerHTML || ''
      };
      if (isEdit) {
        await axios.put(getApiUrl(`equipes/${id}`), payload);
        message.success('Equipe atualizada com sucesso');
      } else {
        await axios.post(getApiUrl('equipes'), payload);
        message.success('Equipe criada com sucesso');
      }
      navigate('/equipes');
    } catch {
      message.error('Erro ao salvar equipe');
    }
  };

  return (
    <Card title={isEdit ? 'Editar Equipe' : 'Nova Equipe'} style={{ maxWidth: 600, margin: '0 auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ nome: '', funcao: '' }}
      >
        <Form.Item name="nome" label="Nome" rules={[{ required: true, message: 'Informe o nome' }]}>        
          <Input />
        </Form.Item>
        <Form.Item label="Descrição">
          <div style={{ marginBottom: 8 }}>
            <Button size="small" onClick={() => document.execCommand('bold')}>B</Button>
            <Button size="small" onClick={() => document.execCommand('italic')}>I</Button>
            <Button size="small" onClick={() => document.execCommand('underline')}>U</Button>
          </div>
          <div ref={descRef} contentEditable style={{ minHeight: 120, border: '1px solid #d9d9d9', padding: 8, borderRadius: 4 }} />
        </Form.Item>
        <Form.Item label="Sobre">
          <div style={{ marginBottom: 8 }}>
            <Button size="small" onClick={() => document.execCommand('bold')}>B</Button>
            <Button size="small" onClick={() => document.execCommand('italic')}>I</Button>
            <Button size="small" onClick={() => document.execCommand('underline')}>U</Button>
          </div>
          <div ref={sobreRef} contentEditable style={{ minHeight: 120, border: '1px solid #d9d9d9', padding: 8, borderRadius: 4 }} />
        </Form.Item>
        <Form.Item name="funcao" label="Função">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {isEdit ? 'Atualizar' : 'Criar'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/equipes')}>
            Cancelar
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EquipeForm;
